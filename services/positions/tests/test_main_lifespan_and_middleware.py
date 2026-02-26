from __future__ import annotations

from typing import Any

import pytest
from fastapi.testclient import TestClient

import app.main as main_mod
from app.core.config import Settings


def _settings() -> Settings:
    return Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET="test-secret-at-least-32-bytes-long-00000000",
        FRONTEND_ORIGIN="http://localhost:5173",
        LOG_LEVEL="INFO",
    )


def test_middleware_returns_request_id_and_cors_on_exception(monkeypatch: pytest.MonkeyPatch):
    app = main_mod.create_app(_settings())

    @app.get("/boom")
    async def boom():
        raise RuntimeError("kaboom")

    c = TestClient(app)
    r = c.get("/boom", headers={"Origin": "http://localhost:5173"})
    assert r.status_code == 500

    assert "x-request-id" in r.headers

    assert r.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_lifespan_runs_without_real_db(monkeypatch: pytest.MonkeyPatch):
    """
    Covers main.lifespan lines by monkeypatching wait_for_db, run_migrations, and poller.
    """
    calls: dict[str, int] = {"wait": 0, "migrate": 0, "start": 0, "stop": 0}

    async def fake_wait_for_db(*args: Any, **kwargs: Any) -> None:
        calls["wait"] += 1

    def fake_run_migrations(*args: Any, **kwargs: Any) -> None:
        calls["migrate"] += 1

    class FakePoller:
        def __init__(self, *args: Any, **kwargs: Any) -> None:
            pass

        def start(self) -> None:
            calls["start"] += 1

        def stop(self) -> None:
            calls["stop"] += 1

    monkeypatch.setattr(main_mod, "wait_for_db", fake_wait_for_db)
    monkeypatch.setattr(main_mod, "run_migrations", fake_run_migrations)
    monkeypatch.setattr(main_mod, "PricePoller", FakePoller)

    app = main_mod.create_app(_settings())

    with TestClient(app) as c:
        r = c.get("/api/health")
        assert r.status_code == 200

    assert calls["wait"] == 1
    assert calls["migrate"] == 1
    assert calls["start"] == 1
    assert calls["stop"] == 1
