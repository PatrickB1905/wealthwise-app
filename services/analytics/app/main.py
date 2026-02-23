from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import Settings
from app.core.logging import configure_logging
from app.db.engine import build_engine


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings: Settings = app.state.settings
    app.state.db_engine = build_engine(settings.database_url)

    try:
        yield
    finally:
        http_client = getattr(app.state, "http_client", None)
        if http_client is not None:
            http_client.close()


def create_app(settings: Settings | None = None) -> FastAPI:
    """
    App factory:
    - `settings=None` -> load from environment / .env
    - tests can pass Settings(...) directly for isolation
    """
    settings = settings or Settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title="Analytics Service",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.state.settings = settings

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.frontend_origins,
        allow_credentials=True,
        allow_methods=["GET", "OPTIONS"],
        allow_headers=["*"],
    )

    app.include_router(router)
    return app
