from __future__ import annotations

from typing import Any

import socketio

import app.main as main_mod
from app.core.config import Settings
from app.services.realtime import SocketEmitter


def _settings() -> Settings:
    return Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET="secret-at-least-32-bytes-long-000000000000",
        FRONTEND_ORIGIN="http://localhost:5173",
        LOG_LEVEL="INFO",
    )


def test_create_app_sets_state_and_routes():
    app = main_mod.create_app(_settings())
    assert app.state.settings is not None
    assert isinstance(app.state.sio, socketio.AsyncServer)
    assert isinstance(app.state.emitter, SocketEmitter)

    paths = {r.path for r in app.router.routes}
    assert "/api/health" in paths


def test_build_sio_asgi_app_returns_asgi_app():
    asgi = main_mod.build_sio_asgi_app(_settings())
    assert isinstance(asgi, socketio.ASGIApp)


def test_lazy_app_builds_once(monkeypatch: Any):
    calls: dict[str, int] = {"n": 0}

    class DummyASGI:
        async def __call__(self, scope: Any, receive: Any, send: Any) -> None:
            return None

    def fake_build(*args: Any, **kwargs: Any) -> DummyASGI:
        calls["n"] += 1
        return DummyASGI()

    monkeypatch.setattr(main_mod, "build_sio_asgi_app", fake_build)

    lazy = main_mod.LazySioASGIApp()
    a1 = lazy._ensure_built()
    a2 = lazy._ensure_built()
    assert a1 is a2
    assert calls["n"] == 1
