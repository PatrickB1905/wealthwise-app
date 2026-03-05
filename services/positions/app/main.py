from __future__ import annotations

import asyncio
import logging
import uuid
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from threading import Lock
from typing import Any, cast

import socketio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from app.api.routes import router
from app.core.config import Settings
from app.core.logging import configure_logging
from app.db.engine import create_engine_and_sessionmaker
from app.db.migrations import run_migrations, wait_for_db
from app.repositories.positions import PositionsRepository
from app.repositories.quote_snapshots import QuoteSnapshotsRepository
from app.services.market_data import fetch_quotes_from_market_data
from app.services.price_poller import PricePoller
from app.services.realtime import SocketEmitter

log = logging.getLogger("positions")


def _utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = cast(Settings, app.state.settings)

    engine, sessionmaker = create_engine_and_sessionmaker(settings.database_url)
    app.state.db_engine = engine
    app.state.db_sessionmaker = sessionmaker

    await wait_for_db(engine=engine)
    run_migrations(database_url=settings.database_url)

    sio = cast(socketio.AsyncServer, app.state.sio)

    poller = PricePoller(
        sessionmaker=sessionmaker,
        emitter=cast(SocketEmitter, app.state.emitter),
        settings=settings,
    )
    app.state.price_poller = poller

    @sio.event  # type: ignore[untyped-decorator]
    async def connect(sid: str, environ: dict[str, Any], auth: Any) -> bool:
        return True

    @sio.event  # type: ignore[untyped-decorator]
    async def join(sid: str, user_id: int) -> None:
        uid = int(user_id)
        room = f"user_{uid}"
        await sio.enter_room(sid, room)

        try:
            async with sessionmaker() as session:
                pos_repo = PositionsRepository(session=session)
                by_user = await pos_repo.list_open_tickers_grouped_by_user()
                tickers = by_user.get(uid, [])

                symbols: list[str] = []
                seen: set[str] = set()
                for t in tickers:
                    sym = str(t).strip().upper()
                    if not sym or sym in seen:
                        continue
                    seen.add(sym)
                    symbols.append(sym)
                    if len(symbols) >= settings.max_symbols_per_user:
                        break

                if not symbols:
                    return

                snaps_repo = QuoteSnapshotsRepository(session=session)
                snaps = await snaps_repo.get_many(symbols)

                now = _utc_now_naive()
                now_iso = now.isoformat()
                max_age = max(1, int(settings.price_snapshot_max_age_seconds))

                fresh_payload: list[dict[str, Any]] = []
                stale_or_missing: list[str] = []

                for sym in symbols:
                    row = snaps.get(sym)
                    if row is None:
                        stale_or_missing.append(sym)
                        continue

                    age = (now - row.updatedAt).total_seconds()
                    if age > max_age:
                        stale_or_missing.append(sym)
                        continue

                    fresh_payload.append(
                        {
                            "symbol": row.symbol,
                            "currentPrice": row.currentPrice,
                            "dailyChangePercent": row.dailyChangePercent,
                            "logoUrl": row.logoUrl,
                            "updatedAt": row.updatedAt.isoformat(),
                        }
                    )

                refreshed_payload: list[dict[str, Any]] = []
                if stale_or_missing:
                    refreshed = await asyncio.to_thread(
                        fetch_quotes_from_market_data,
                        settings.market_data_service_url,
                        stale_or_missing,
                    )
                    if refreshed:
                        await snaps_repo.upsert_many(refreshed)
                        try:
                            await session.commit()
                        except Exception:
                            await session.rollback()
                            raise

                        for q in refreshed:
                            if not isinstance(q, dict):
                                continue
                            sym = str(q.get("symbol") or "").strip().upper()
                            if not sym:
                                continue
                            refreshed_payload.append(
                                {
                                    "symbol": sym,
                                    "currentPrice": q.get("currentPrice"),
                                    "dailyChangePercent": q.get("dailyChangePercent"),
                                    "logoUrl": q.get("logoUrl") or "",
                                    "updatedAt": now_iso,
                                }
                            )

                payload = fresh_payload + refreshed_payload
                if payload:
                    emitter = cast(SocketEmitter, app.state.emitter)
                    await emitter.emit_to_sid(sid=sid, event="price:snapshot", data=payload)
        except Exception:
            log.exception("failed to send price snapshot on join (user_id=%s)", user_id)

    try:
        poller.start()
        yield
    finally:
        poller.stop()
        await engine.dispose()


def create_app(settings: Settings | None = None) -> FastAPI:
    s = settings or Settings()  # type: ignore[call-arg]
    configure_logging(s.log_level)

    app = FastAPI(
        title="Positions Service",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.state.settings = s

    @app.middleware("http")
    async def request_id_and_error_logging(
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        req_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        try:
            resp = await call_next(request)
            resp.headers["x-request-id"] = req_id
            log.info(
                "request_id=%s method=%s path=%s status=%s",
                req_id,
                request.method,
                request.url.path,
                resp.status_code,
            )
            return resp
        except Exception:
            log.exception(
                "request_id=%s method=%s path=%s unhandled_exception",
                req_id,
                request.method,
                request.url.path,
            )
            return JSONResponse(
                status_code=500,
                content={"error": "Internal Server Error", "requestId": req_id},
                headers={"x-request-id": req_id},
            )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=s.frontend_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    sio = socketio.AsyncServer(
        async_mode="asgi",
        cors_allowed_origins=s.frontend_origins,
        logger=False,
        engineio_logger=False,
    )
    app.state.sio = sio
    app.state.emitter = SocketEmitter(sio=sio)

    app.include_router(router)
    return app


def build_sio_asgi_app(settings: Settings | None = None) -> socketio.ASGIApp:
    fastapi_app = create_app(settings=settings)
    sio_server = cast(socketio.AsyncServer, fastapi_app.state.sio)
    return socketio.ASGIApp(socketio_server=sio_server, other_asgi_app=fastapi_app)


class LazySioASGIApp:
    def __init__(self) -> None:
        self._lock = Lock()
        self._app: socketio.ASGIApp | None = None

    def _ensure_built(self) -> socketio.ASGIApp:
        if self._app is not None:
            return self._app
        with self._lock:
            if self._app is None:
                self._app = build_sio_asgi_app()
        return self._app

    async def __call__(self, scope: Any, receive: Any, send: Any) -> None:
        app = self._ensure_built()
        await app(scope, receive, send)


sio_app = LazySioASGIApp()
