from __future__ import annotations

import asyncio
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import app.main as main_mod
from app.core.config import Settings


def _settings() -> Settings:
    return Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET="test-secret-at-least-32-bytes-long-00000000",
        FRONTEND_ORIGIN="http://localhost:5173",
        LOG_LEVEL="INFO",
        MAX_SYMBOLS_PER_USER=10,
        PRICE_SNAPSHOT_MAX_AGE_SECONDS=60,
        PRICE_POLL_INTERVAL_SECONDS=1,
    )


def test_create_app_sets_state_and_includes_router() -> None:
    app = main_mod.create_app(settings=_settings())
    assert app.state.settings is not None
    assert app.state.sio is not None
    assert app.state.emitter is not None


def test_request_id_middleware_adds_header_on_success() -> None:
    app = main_mod.create_app(settings=_settings())

    @app.get("/ok")
    async def ok() -> dict[str, str]:
        return {"ok": "1"}

    c = TestClient(app)

    r = c.get("/ok")
    assert r.status_code == 200
    assert r.headers.get("x-request-id")

    r2 = c.get("/ok", headers={"x-request-id": "abc-123"})
    assert r2.status_code == 200
    assert r2.headers.get("x-request-id") == "abc-123"


def test_request_id_middleware_returns_500_json_on_unhandled_exception() -> None:
    app = main_mod.create_app(settings=_settings())

    @app.get("/boom")
    async def boom() -> dict[str, str]:
        raise RuntimeError("nope")

    c = TestClient(app)

    r = c.get("/boom", headers={"x-request-id": "req-999"})
    assert r.status_code == 500
    body = r.json()
    assert body["error"] == "Internal Server Error"
    assert body["requestId"] == "req-999"
    assert r.headers.get("x-request-id") == "req-999"


def test_build_sio_asgi_app_returns_asgi_callable() -> None:
    app = main_mod.build_sio_asgi_app(settings=_settings())
    assert callable(app)


def test_lazy_sio_asgi_app_builds_once(monkeypatch: pytest.MonkeyPatch) -> None:
    built: list[Any] = []

    def fake_build(*args: Any, **kwargs: Any) -> Any:
        built.append(object())
        return built[-1]

    monkeypatch.setattr(main_mod, "build_sio_asgi_app", fake_build)

    lazy = main_mod.LazySioASGIApp()
    a1 = lazy._ensure_built()
    a2 = lazy._ensure_built()
    assert a1 is a2
    assert len(built) == 1


def test_lazy_sio_asgi_app_is_asgi_callable(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_asgi(scope: Any, receive: Any, send: Any) -> None:
        await send({"type": "http.response.start", "status": 200, "headers": []})
        await send({"type": "http.response.body", "body": b"ok"})

    monkeypatch.setattr(main_mod, "build_sio_asgi_app", lambda *a, **k: fake_asgi)

    lazy = main_mod.LazySioASGIApp()

    messages: list[dict[str, Any]] = []

    async def receive() -> dict[str, Any]:
        await asyncio.sleep(0)
        return {"type": "http.request"}

    async def send(msg: dict[str, Any]) -> None:
        messages.append(msg)

    asyncio.run(
        lazy(
            scope={"type": "http", "method": "GET", "path": "/", "headers": []},
            receive=receive,
            send=send,
        )
    )

    assert any(m.get("type") == "http.response.start" and m.get("status") == 200 for m in messages)


# ----------------------------------
# Lifespan + Socket.IO join coverage
# ----------------------------------


class _FakeSio:
    def __init__(self) -> None:
        self.handlers: dict[str, Callable[..., Any]] = {}
        self.rooms: list[tuple[str, str]] = []

    def event(self, fn: Callable[..., Any]) -> Callable[..., Any]:
        self.handlers[fn.__name__] = fn
        return fn

    async def enter_room(self, sid: str, room: str) -> None:
        self.rooms.append((sid, room))


class _FakeEmitter:
    def __init__(self) -> None:
        self.sid_events: list[dict[str, Any]] = []

    async def emit_to_sid(self, *, sid: str, event: str, data: Any) -> None:
        self.sid_events.append({"sid": sid, "event": event, "data": data})


@dataclass
class _SnapRow:
    symbol: str
    currentPrice: float
    dailyChangePercent: float
    logoUrl: str
    updatedAt: datetime


class _SessionCM:
    def __init__(self, session: Any) -> None:
        self._session = session

    async def __aenter__(self) -> Any:
        return self._session

    async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        return None


class _FakeSession:
    def __init__(self) -> None:
        self.commits = 0
        self.rollbacks = 0
        self.commit_raises: Exception | None = None

    async def commit(self) -> None:
        self.commits += 1
        if self.commit_raises:
            raise self.commit_raises

    async def rollback(self) -> None:
        self.rollbacks += 1


class _FakeSessionMaker:
    def __init__(self, session: _FakeSession) -> None:
        self._session = session

    def __call__(self) -> _SessionCM:
        return _SessionCM(self._session)


@pytest.mark.asyncio
async def test_lifespan_registers_socket_handlers_and_join_emits_snapshot(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def fake_wait_for_db(*args: Any, **kwargs: Any) -> None:
        return None

    def fake_run_migrations(*args: Any, **kwargs: Any) -> None:
        return None

    class FakeEngine:
        async def dispose(self) -> None:
            return None

    session = _FakeSession()
    sessionmaker = _FakeSessionMaker(session)

    def fake_create_engine_and_sessionmaker(database_url: str) -> tuple[Any, Any]:
        return FakeEngine(), sessionmaker

    class FakePoller:
        def __init__(self, *args: Any, **kwargs: Any) -> None:
            pass

        def start(self) -> None:
            return None

        def stop(self) -> None:
            return None

    class FakePositionsRepo:
        def __init__(self, session: Any) -> None:
            pass

        async def list_open_tickers_grouped_by_user(self) -> dict[int, list[str]]:
            return {1: ["aapl", "MSFT", "  ", "AAPL"]}

    class FakeSnapsRepo:
        def __init__(self, session: Any) -> None:
            pass

        async def get_many(self, symbols: list[str]) -> dict[str, _SnapRow]:
            # AAPL fresh, MSFT missing => forces refresh for MSFT only
            now = datetime.now(timezone.utc).replace(tzinfo=None)
            return {
                "AAPL": _SnapRow(
                    symbol="AAPL",
                    currentPrice=10.0,
                    dailyChangePercent=1.0,
                    logoUrl="a",
                    updatedAt=now,
                )
            }

        async def upsert_many(self, rows: list[dict[str, Any]]) -> None:
            return None

    def fake_fetch_quotes_from_market_data(
        base_url: str, symbols: list[str]
    ) -> list[dict[str, Any]]:
        assert symbols == ["MSFT"]
        return [{"symbol": "MSFT", "currentPrice": 20.0, "dailyChangePercent": 2.0, "logoUrl": "m"}]

    monkeypatch.setattr(main_mod, "wait_for_db", fake_wait_for_db)
    monkeypatch.setattr(main_mod, "run_migrations", fake_run_migrations)
    monkeypatch.setattr(
        main_mod, "create_engine_and_sessionmaker", fake_create_engine_and_sessionmaker
    )
    monkeypatch.setattr(main_mod, "PricePoller", FakePoller)
    monkeypatch.setattr(main_mod, "PositionsRepository", FakePositionsRepo)
    monkeypatch.setattr(main_mod, "QuoteSnapshotsRepository", FakeSnapsRepo)
    monkeypatch.setattr(
        main_mod, "fetch_quotes_from_market_data", fake_fetch_quotes_from_market_data
    )

    app = FastAPI()
    app.state.settings = _settings()
    app.state.sio = _FakeSio()
    app.state.emitter = _FakeEmitter()

    async with main_mod.lifespan(app):
        # Handlers should be registered
        assert "connect" in app.state.sio.handlers
        assert "join" in app.state.sio.handlers

        ok = await app.state.sio.handlers["connect"]("sid1", {}, None)
        assert ok is True

        await app.state.sio.handlers["join"]("sid1", 1)

        # join should place sid into room
        assert ("sid1", "user_1") in app.state.sio.rooms

        # join should emit snapshot containing AAPL (fresh) + MSFT (refreshed)
        emitted = app.state.emitter.sid_events
        assert emitted, "Expected at least one emit_to_sid call"
        payload = emitted[-1]["data"]
        assert any(p["symbol"] == "AAPL" for p in payload)
        assert any(p["symbol"] == "MSFT" for p in payload)


@pytest.mark.asyncio
async def test_lifespan_join_commit_failure_rolls_back(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_wait_for_db(*args: Any, **kwargs: Any) -> None:
        return None

    def fake_run_migrations(*args: Any, **kwargs: Any) -> None:
        return None

    class FakeEngine:
        async def dispose(self) -> None:
            return None

    session = _FakeSession()
    session.commit_raises = RuntimeError("db down")
    sessionmaker = _FakeSessionMaker(session)

    def fake_create_engine_and_sessionmaker(database_url: str) -> tuple[Any, Any]:
        return FakeEngine(), sessionmaker

    class FakePoller:
        def __init__(self, *args: Any, **kwargs: Any) -> None:
            pass

        def start(self) -> None:
            return None

        def stop(self) -> None:
            return None

    class FakePositionsRepo:
        def __init__(self, session: Any) -> None:
            pass

        async def list_open_tickers_grouped_by_user(self) -> dict[int, list[str]]:
            return {1: ["MSFT"]}

    class FakeSnapsRepo:
        def __init__(self, session: Any) -> None:
            pass

        async def get_many(self, symbols: list[str]) -> dict[str, Any]:
            return {}

        async def upsert_many(self, rows: list[dict[str, Any]]) -> None:
            return None

    def fake_fetch_quotes_from_market_data(
        base_url: str, symbols: list[str]
    ) -> list[dict[str, Any]]:
        return [{"symbol": "MSFT", "currentPrice": 1.0, "dailyChangePercent": 0.0, "logoUrl": ""}]

    monkeypatch.setattr(main_mod, "wait_for_db", fake_wait_for_db)
    monkeypatch.setattr(main_mod, "run_migrations", fake_run_migrations)
    monkeypatch.setattr(
        main_mod, "create_engine_and_sessionmaker", fake_create_engine_and_sessionmaker
    )
    monkeypatch.setattr(main_mod, "PricePoller", FakePoller)
    monkeypatch.setattr(main_mod, "PositionsRepository", FakePositionsRepo)
    monkeypatch.setattr(main_mod, "QuoteSnapshotsRepository", FakeSnapsRepo)
    monkeypatch.setattr(
        main_mod, "fetch_quotes_from_market_data", fake_fetch_quotes_from_market_data
    )

    app = FastAPI()
    app.state.settings = _settings()
    app.state.sio = _FakeSio()
    app.state.emitter = _FakeEmitter()

    async with main_mod.lifespan(app):
        await app.state.sio.handlers["join"]("sid1", 1)

    assert session.commits == 1
    assert session.rollbacks == 1
