from __future__ import annotations

import os
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _split_csv(value: str) -> list[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env" if os.getenv("LOAD_DOTENV", "1") == "1" else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    positions_url: str = Field(
        default="http://localhost:4000/api",
        validation_alias="POSITIONS_SERVICE_URL",
    )

    market_data_url: str = Field(
        default="http://localhost:5000/api",
        validation_alias="MARKET_DATA_SERVICE_URL",
    )

    frontend_origin: str = Field(
        default="http://localhost:5173",
        validation_alias="FRONTEND_ORIGIN",
    )

    frontend_origins_csv: str | None = Field(
        default=None,
        validation_alias="FRONTEND_ORIGINS",
    )

    jwt_secret: str = Field(default="change_me", validation_alias="JWT_SECRET")

    port: int = Field(default=7000, validation_alias="ANALYTICS_SERVICE_PORT")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")

    analytics_cache_ttl_seconds: int = Field(
        default=30, validation_alias="ANALYTICS_CACHE_TTL_SECONDS"
    )
    analytics_max_days: int = Field(default=730, validation_alias="ANALYTICS_MAX_DAYS")

    @property
    def frontend_origins(self) -> list[str]:
        if self.frontend_origins_csv:
            return _split_csv(self.frontend_origins_csv)
        return [self.frontend_origin]

@lru_cache
def get_settings() -> Settings:
    """
    Pydantic loads env vars, but using model_validate({}) avoids mypy thinking we must pass
    required fields into the constructor.
    """
    return Settings.model_validate({})