from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.repositories.positions import PositionsRepository
from app.services.quotes import fetch_quotes
from app.services.realtime import Emitter

log = logging.getLogger(__name__)


def _uniq(xs: list[str]) -> list[str]:
    return list(dict.fromkeys(xs))


@dataclass
class PricePoller:
    sessionmaker: async_sessionmaker[AsyncSession]
    emitter: Emitter
    poll_interval_seconds: int
    max_symbols_per_user: int

    _task: asyncio.Task[None] | None = None
    _stop: asyncio.Event = field(default_factory=asyncio.Event)

    def start(self) -> None:
        if self._task is not None:
            return
        self._stop.clear()
        self._task = asyncio.create_task(self._run())

    def stop(self) -> None:
        self._stop.set()
        if self._task is not None:
            self._task.cancel()
            self._task = None

    async def _run(self) -> None:
        while not self._stop.is_set():
            try:
                await self._tick()
            except Exception:
                log.exception("price poll tick failed unexpectedly")
            await asyncio.sleep(max(1, int(self.poll_interval_seconds)))

    async def _tick(self) -> None:
        async with self.sessionmaker() as session:
            repo = PositionsRepository(session=session)
            by_user = await repo.list_open_tickers_grouped_by_user()

        for user_id, tickers in by_user.items():
            symbols = _uniq(tickers)[: self.max_symbols_per_user]
            if not symbols:
                continue

            quotes = fetch_quotes(symbols)
            if not quotes:
                continue

            await self.emitter.emit(
                room=f"user_{user_id}",
                event="price:update",
                data=quotes,
            )
