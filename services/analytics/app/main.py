from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import Settings
from app.core.logging import configure_logging


def create_app() -> FastAPI:
    settings = Settings()

    configure_logging(settings.log_level)

    app = FastAPI(title="Analytics Service")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_credentials=True,
        allow_methods=["GET", "OPTIONS"],
        allow_headers=["*"],
    )

    app.state.settings = settings
    app.include_router(router)
    return app
