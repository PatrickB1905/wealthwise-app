from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = Field(validation_alias="DATABASE_URL")
    market_data_url: str = Field(validation_alias="MARKET_DATA_URL")
    frontend_origin: str = Field(default="http://localhost:5173", validation_alias="FRONTEND_ORIGIN")
    port: int = Field(default=7000, validation_alias="PORT")

    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")