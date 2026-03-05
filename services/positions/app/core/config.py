from __future__ import annotations

import os

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _dotenv_path() -> str | None:
    """
    Behavior:
    - In Docker we set LOAD_DOTENV=0, and we rely on real env vars (env_file in compose).
    - Locally, LOAD_DOTENV defaults to 1 so a .env file is convenient.
    """
    return ".env" if os.getenv("LOAD_DOTENV", "1").strip() == "1" else None


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_dotenv_path(),
        case_sensitive=False,
        extra="ignore",
    )

    # Required
    database_url: str = Field(alias="DATABASE_URL")
    jwt_secret: str = Field(alias="JWT_SECRET")

    # CORS (prefer FRONTEND_ORIGINS allowlist; fallback to FRONTEND_ORIGIN)
    frontend_origin: str = Field(default="http://localhost:5173", alias="FRONTEND_ORIGIN")
    frontend_origins_raw: str | None = Field(default=None, alias="FRONTEND_ORIGINS")

    # App
    port: int = Field(default=4000, alias="POSITIONS_SERVICE_PORT")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # Polling
    price_poll_interval_seconds: int = Field(default=10, alias="PRICE_POLL_INTERVAL_SECONDS")
    max_symbols_per_user: int = Field(default=50, alias="MAX_SYMBOLS_PER_USER")

    price_snapshot_max_age_seconds: int = Field(default=60, alias="PRICE_SNAPSHOT_MAX_AGE_SECONDS")

    market_data_service_url: str = Field(
        default="http://market-data:5000/api",
        alias="MARKET_DATA_SERVICE_URL",
    )

    @field_validator("market_data_service_url")
    @classmethod
    def _strip_market_data_url(cls, v: str) -> str:
        return v.strip().rstrip("/")

    @field_validator("frontend_origin")
    @classmethod
    def _strip_frontend_origin(cls, v: str) -> str:
        return v.strip()

    @property
    def frontend_origins(self) -> list[str]:
        """
        Returns an allowlist for CORS.
        - If FRONTEND_ORIGINS is set: comma-separated list is used
        - else fallback to FRONTEND_ORIGIN
        """
        if self.frontend_origins_raw:
            origins = [o.strip() for o in self.frontend_origins_raw.split(",")]
            return [o for o in origins if o]
        return [self.frontend_origin]
