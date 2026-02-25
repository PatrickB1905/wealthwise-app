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
    - local `.env` for non-docker runs (optional)
    """

    model_config = SettingsConfigDict(
        # Local dev convenience: load from file
        # Docker: set LOAD_DOTENV=0 to rely on injected env vars only
        env_file=".env" if os.getenv("LOAD_DOTENV", "1") == "1" else None,
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    news_api_key: str = Field(..., validation_alias="NEWS_API_KEY")

    frontend_origin: str = Field(
        default="http://localhost:5173",
        validation_alias="FRONTEND_ORIGIN",
    )

    frontend_origins_csv: str | None = Field(
        default=None,
        validation_alias="FRONTEND_ORIGINS",
    )

    port: int = Field(default=6500, validation_alias="NEWS_PORT")

    per_symbol_limit: int = Field(default=5, validation_alias="NEWS_PER_SYMBOL_LIMIT")
    request_timeout_seconds: float = Field(default=5.0, validation_alias="NEWS_TIMEOUT_SECONDS")

    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")

    @property
    def frontend_origins(self) -> list[str]:
        if self.frontend_origins_csv:
            return _split_csv(self.frontend_origins_csv)
        return [self.frontend_origin]
