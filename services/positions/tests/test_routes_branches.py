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
VALID_SELL_DATE = datetime(2026, 3, 7, tzinfo=timezone.utc).isoformat()


class DummySession:
    """Marker session; repositories are faked in tests."""


class DummyEmitter:
    def __init__(self) -> None:
        self.events: list[dict[str, Any]] = []

    async def emit(self, room: str, event: str, data: Any) -> None:
        self.events.append({"room": room, "event": event, "data": data})


def _make_app_no_route_overrides(
    *,
    settings: Settings,
    emitter: DummyEmitter,
    monkeypatch: pytest.MonkeyPatch,
) -> FastAPI:
    app = FastAPI()
    app.state.settings = settings
    app.state.emitter = emitter
    app.include_router(routes_mod.router)

    async def override_get_session(_: Any = None):
        yield DummySession()

    def override_user_id() -> int:
        return 1

    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[routes_mod.get_current_user_id] = override_user_id

    monkeypatch.setattr(routes_mod, "hash_password", lambda pw: f"HASH:{pw}")
    monkeypatch.setattr(routes_mod, "verify_password", lambda pw, h: h == f"HASH:{pw}")

    return app


def _settings() -> Settings:
    return Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET="test-secret-at-least-32-bytes-long-00000000",
        FRONTEND_ORIGIN="http://localhost:5173",
        LOG_LEVEL="INFO",
    )


def test_list_positions_rejects_invalid_status(client: TestClient):
    r = client.get("/api/positions?status=weird")
    assert r.status_code == 400
    assert "status must be" in r.json()["detail"]


def test_create_position_rejects_blank_ticker(client: TestClient):
    r = client.post(
        "/api/positions",
        json={
            "ticker": "   ",
            "quantity": 1.0,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert r.status_code == 400


def test_create_position_rejects_non_positive_quantity(client: TestClient):
    r = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 0,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert r.status_code == 422


def test_create_position_rejects_non_positive_buy_price(client: TestClient):
    r = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1.0,
            "buyPrice": 0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert r.status_code == 422


def test_update_position_rejects_non_positive_quantity(client: TestClient):
    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1.0,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pos_id = created.json()["id"]

    r = client.put(
        f"/api/positions/{pos_id}",
        json={
            "quantity": -1.0,
            "buyPrice": 11.0,
            "buyDate": VALID_BUY_DATE,
            "sellPrice": None,
            "sellDate": None,
        },
    )
    assert r.status_code == 422


def test_update_position_rejects_non_positive_buy_price(client: TestClient):
    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1.0,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pos_id = created.json()["id"]

    r = client.put(
        f"/api/positions/{pos_id}",
        json={
            "quantity": 2.0,
            "buyPrice": -11.0,
            "buyDate": VALID_BUY_DATE,
            "sellPrice": None,
            "sellDate": None,
        },
    )
    assert r.status_code == 422


def test_close_position_404_when_missing(client: TestClient):
    r = client.put(
        "/api/positions/999/close",
        json={"sellPrice": 12.0, "sellDate": VALID_SELL_DATE},
    )
    assert r.status_code == 404


def test_close_position_rejects_missing_sell_price(client: TestClient):
    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1.0,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pos_id = created.json()["id"]

    r = client.put(
        f"/api/positions/{pos_id}/close",
        json={"sellDate": VALID_SELL_DATE},
    )
    assert r.status_code == 422


def test_close_position_allows_zero_sell_price(client: TestClient):
    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1.0,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pos_id = created.json()["id"]

    r = client.put(
        f"/api/positions/{pos_id}/close",
        json={
            "sellPrice": 0,
            "sellDate": VALID_SELL_DATE,
        },
    )
    assert r.status_code == 200


def test_close_position_rejects_missing_sell_date(client: TestClient):
    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1.0,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pos_id = created.json()["id"]

    r = client.put(
        f"/api/positions/{pos_id}/close",
        json={"sellPrice": 10.0},
    )
    assert r.status_code == 422


def test_update_position_404_when_missing(client: TestClient):
    r = client.put(
        "/api/positions/999",
        json={
            "quantity": 2.0,
            "buyPrice": 11.0,
            "buyDate": VALID_BUY_DATE,
            "sellPrice": None,
            "sellDate": None,
        },
    )
    assert r.status_code == 404


def test_delete_position_404_when_missing(client: TestClient):
    r = client.delete("/api/positions/999")
    assert r.status_code == 404


def test_delete_position_emits_event(client: TestClient, emitter):
    created = client.post(
        "/api/positions",
        json={
            "ticker": "aapl",
            "quantity": 1.0,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pos_id = created.json()["id"]

    r = client.delete(f"/api/positions/{pos_id}")
    assert r.status_code == 204

    assert any(
        e["event"] == "position:deleted" and e["data"]["id"] == pos_id for e in emitter.events
    )


def test_get_settings_and_get_emitter_helpers_are_covered(monkeypatch: pytest.MonkeyPatch):
    s = _settings()
    emitter = DummyEmitter()

    from tests.conftest import FakePositionsRepository, FakeUsersRepository  # type: ignore

    monkeypatch.setattr(routes_mod, "UsersRepository", FakeUsersRepository)
    monkeypatch.setattr(routes_mod, "PositionsRepository", FakePositionsRepository)

    app = _make_app_no_route_overrides(settings=s, emitter=emitter, monkeypatch=monkeypatch)
    c = TestClient(app)

    r = c.post(
        "/api/auth/register",
        json={"firstName": "A", "lastName": "B", "email": "x@y.com", "password": "pw"},
    )
    assert r.status_code == 201
    assert "token" in r.json()


def test_register_returns_500_when_hashing_fails(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setattr(
        routes_mod, "hash_password", lambda _: (_ for _ in ()).throw(RuntimeError("boom"))
    )

    r = client.post(
        "/api/auth/register",
        json={"firstName": "A", "lastName": "B", "email": "h@b.com", "password": "pw"},
    )
    assert r.status_code == 500
    assert "password hashing" in r.json()["detail"].lower()


def test_register_returns_409_when_repo_raises_emailalreadyexists(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
):
    orig_create = routes_mod.UsersRepository.create

    async def boom(*args: Any, **kwargs: Any):
        raise routes_mod.UsersRepository.EmailAlreadyExists()

    monkeypatch.setattr(routes_mod.UsersRepository, "create", boom)

    r = client.post(
        "/api/auth/register",
        json={"firstName": "A", "lastName": "B", "email": "dup@b.com", "password": "pw"},
    )
    assert r.status_code == 409

    monkeypatch.setattr(routes_mod.UsersRepository, "create", orig_create)


def test_login_returns_500_when_verify_raises(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    client.post(
        "/api/auth/register",
        json={"firstName": "A", "lastName": "B", "email": "v@b.com", "password": "pw"},
    )

    monkeypatch.setattr(
        routes_mod, "verify_password", lambda *_: (_ for _ in ()).throw(RuntimeError("boom"))
    )

    r = client.post("/api/auth/login", json={"email": "v@b.com", "password": "pw"})
    assert r.status_code == 500
    assert "verification" in r.json()["detail"].lower()


def test_update_password_validation_missing_fields(client: TestClient):
    r = client.put("/api/auth/me/password", json={"currentPassword": "", "newPassword": ""})
    assert r.status_code == 400
