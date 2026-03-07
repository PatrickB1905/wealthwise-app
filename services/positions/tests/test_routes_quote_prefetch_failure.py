from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import app.api.routes as routes_mod
from app.core.config import Settings
from app.db.engine import get_session

VALID_BUY_DATE = datetime(2026, 3, 6, tzinfo=timezone.utc).isoformat()


class _Session:
    def __init__(self) -> None:
        self.rollbacks = 0
        self.commits = 0

    async def commit(self) -> None:
        self.commits += 1

    async def rollback(self) -> None:
        self.rollbacks += 1


class _Emitter:
    def __init__(self) -> None:
        self.events: list[dict[str, Any]] = []

    async def emit(self, room: str, event: str, data: Any) -> None:
        self.events.append({"room": room, "event": event, "data": data})


def _settings() -> Settings:
    return Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET="test-secret-at-least-32-bytes-long-00000000",
        FRONTEND_ORIGIN="http://localhost:5173",
        LOG_LEVEL="INFO",
    )


def test_create_position_quote_prefetch_exception_rolls_back(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = _Session()
    emitter = _Emitter()

    app = FastAPI()
    app.state.settings = _settings()
    app.state.emitter = emitter
    app.include_router(routes_mod.router)

    async def override_get_session(_: Any = None):
        yield session

    def override_user_id() -> int:
        return 1

    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[routes_mod.get_current_user_id] = override_user_id

    # Use the Fake repo for creating the position
    from tests.conftest import FakePositionsRepository  # type: ignore

    monkeypatch.setattr(routes_mod, "PositionsRepository", FakePositionsRepository)

    # Force the quote prefetch to explode => should hit the except: rollback
    def boom_fetch(*args: Any, **kwargs: Any) -> Any:
        raise RuntimeError("market-data down")

    monkeypatch.setattr(routes_mod, "fetch_quotes_from_market_data", boom_fetch)

    c = TestClient(app)

    r = c.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1.0,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert r.status_code == 201
    assert session.rollbacks == 1
