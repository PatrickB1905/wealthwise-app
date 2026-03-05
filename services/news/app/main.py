from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.clients.newsapi import build_newsapi_client
from app.core.config import Settings
from app.core.logging import configure_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings: Settings = app.state.settings

    if getattr(app.state, "newsapi_client", None) is None:
        app.state.newsapi_client = build_newsapi_client(settings)

    try:
        yield
    finally:
        client = getattr(app.state, "newsapi_client", None)
        if client is not None:
            client.close()


def create_app(settings: Settings | None = None) -> FastAPI:
    """
    App factory:
    - `settings=None` -> load from environment / optional local .env
    - tests can pass Settings(...) directly for isolation
    """
    settings = settings or Settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title="News Service",
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
