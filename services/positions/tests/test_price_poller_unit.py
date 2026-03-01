from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any

import app.services.price_poller as poller_mod


@dataclass
class FakeEmitter:
    events: list[dict[str, Any]]

    async def emit(self, room: str, event: str, data: Any) -> None:
        self.events.append({"room": room, "event": event, "data": data})


@dataclass(frozen=True)
class FakeSettings:
    price_poll_interval_seconds: int = 5
    max_symbols_per_user: int = 10
    market_data_service_url: str = "http://market-data/api"


class DummySession:
    pass


class DummySessionCM:
    async def __aenter__(self) -> DummySession:
        return DummySession()

    async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        return None


class DummySessionMaker:
    def __call__(self) -> DummySessionCM:
        return DummySessionCM()


def test_tick_emits_updates(monkeypatch: Any) -> None:
    class FakeRepo:
        def __init__(self, session: Any) -> None:
            self._session = session

        async def list_open_tickers_grouped_by_user(self) -> dict[int, list[str]]:
            return {7: ["AAPL", "AAPL", "MSFT"], 2: ["TSLA"]}

    def fake_fetch_quotes_from_market_data(
        base_url: str, symbols: list[str]
    ) -> list[dict[str, Any]]:
        assert base_url
        return [
            {"symbol": symbols[0], "currentPrice": 1.0, "dailyChangePercent": 0.0, "logoUrl": ""}
        ]

    monkeypatch.setattr(poller_mod, "PositionsRepository", FakeRepo)
    monkeypatch.setattr(
        poller_mod, "fetch_quotes_from_market_data", fake_fetch_quotes_from_market_data
    )

    emitter = FakeEmitter(events=[])
    poller = poller_mod.PricePoller(
        sessionmaker=DummySessionMaker(),  # type: ignore[arg-type]
        emitter=emitter,
        settings=FakeSettings(max_symbols_per_user=1),
    )
    asyncio.run(poller._tick())

    assert len(emitter.events) == 2
    assert {e["room"] for e in emitter.events} == {"user_7", "user_2"}
    assert all(e["event"] == "price:update" for e in emitter.events)


def test_tick_skips_when_no_symbols_or_no_quotes(monkeypatch: Any) -> None:
    class FakeRepo:
        def __init__(self, session: Any) -> None:
            self._session = session

        async def list_open_tickers_grouped_by_user(self) -> dict[int, list[str]]:
            return {1: [], 2: ["AAPL"]}

    def fake_fetch_quotes_from_market_data(
        base_url: str, symbols: list[str]
    ) -> list[dict[str, Any]]:
        assert base_url
        return []

    monkeypatch.setattr(poller_mod, "PositionsRepository", FakeRepo)
    monkeypatch.setattr(
        poller_mod, "fetch_quotes_from_market_data", fake_fetch_quotes_from_market_data
    )

    emitter = FakeEmitter(events=[])
    poller = poller_mod.PricePoller(
        sessionmaker=DummySessionMaker(),  # type: ignore[arg-type]
        emitter=emitter,
        settings=FakeSettings(max_symbols_per_user=10),
    )
    asyncio.run(poller._tick())
    assert emitter.events == []


def test_start_stop_idempotent(monkeypatch: Any) -> None:
    async def fake_run(self: Any) -> None:
        self._stop.set()

    emitter = FakeEmitter(events=[])
    poller = poller_mod.PricePoller(
        sessionmaker=DummySessionMaker(),  # type: ignore[arg-type]
        emitter=emitter,
        settings=FakeSettings(price_poll_interval_seconds=1),
    )

    monkeypatch.setattr(poller, "_run", fake_run.__get__(poller, type(poller)))

    async def scenario() -> None:
        poller.start()
        poller.start()
        await asyncio.sleep(0)
        poller.stop()
        poller.stop()

    asyncio.run(scenario())
