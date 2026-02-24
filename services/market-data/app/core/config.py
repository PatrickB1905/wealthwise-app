from __future__ import annotations

import os

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _split_csv(value: str) -> list[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


class Settings(BaseSettings):
    """
    Loads from:
    - environment variables (Docker `env_file` -> env vars)
    - local `.env` for non-docker runs (when LOAD_DOTENV=1)
    """

    model_config = SettingsConfigDict(
        env_file=".env" if os.getenv("LOAD_DOTENV", "1") == "1" else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    frontend_origin: str = Field(
        default="http://localhost:5173",
        validation_alias="FRONTEND_ORIGIN",
    )

    frontend_origins_csv: str | None = Field(
        default=None,
        validation_alias="FRONTEND_ORIGINS",
    )

    port: int = Field(default=5000, validation_alias="MARKET_DATA_PORT")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")

    max_symbols: int = Field(default=50, validation_alias="MARKET_DATA_MAX_SYMBOLS")

    @property
    def frontend_origins(self) -> list[str]:
        if self.frontend_origins_csv:
            return _split_csv(self.frontend_origins_csv)
        return [self.frontend_origin]
