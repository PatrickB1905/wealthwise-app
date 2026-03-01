from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import Settings
from app.repositories.positions import PositionsRepository
from app.repositories.quote_snapshots import QuoteSnapshotsRepository
from app.services.market_data import fetch_quotes_from_market_data
from app.services.realtime import Emitter

log = logging.getLogger(__name__)


def _uniq(xs: list[str]) -> list[str]:
    return list(dict.fromkeys(xs))


def _utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


@dataclass
class PricePoller:
    sessionmaker: async_sessionmaker[AsyncSession]
    emitter: Emitter
    settings: Settings

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
            await asyncio.sleep(max(1, int(self.settings.price_poll_interval_seconds)))

    async def _tick(self) -> None:
        async with self.sessionmaker() as session:
            repo = PositionsRepository(session=session)
            by_user = await repo.list_open_tickers_grouped_by_user()

        for user_id, tickers in by_user.items():
            symbols = _uniq([t.strip().upper() for t in tickers if str(t).strip()])[
                : self.settings.max_symbols_per_user
            ]
            if not symbols:
                continue

            quotes = await asyncio.to_thread(
                fetch_quotes_from_market_data,
                self.settings.market_data_service_url,
                symbols,
            )
            if not quotes:
                continue

            now = _utc_now_naive()
            now_iso = now.isoformat()

            try:
                async with self.sessionmaker() as session:
                    snaps = QuoteSnapshotsRepository(session=session)
                    await snaps.upsert_many(quotes)
                    await session.commit()
            except Exception:
                log.exception("failed to persist quote snapshots for user_id=%s", user_id)

            payload: list[dict[str, Any]] = []
            for q in quotes:
                if not isinstance(q, dict):
                    continue
                sym = str(q.get("symbol") or "").strip().upper()
                if not sym:
                    continue
                payload.append(
                    {
                        "symbol": sym,
                        "currentPrice": q.get("currentPrice"),
                        "dailyChangePercent": q.get("dailyChangePercent"),
                        "logoUrl": q.get("logoUrl") or "",
                        "updatedAt": now_iso,
                    }
                )

            if not payload:
                continue

            await self.emitter.emit(
                room=f"user_{user_id}",
                event="price:update",
                data=payload,
            )
