from __future__ import annotations

import asyncio
from pathlib import Path

import alembic.command as alembic_command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine


def _to_sync_database_url(url: str) -> str:
    """
    Alembic runs synchronously, so it must NOT use asyncpg.
    """
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    return url


def _alembic_config() -> Config:
    """
    Build an Alembic Config that is robust inside Docker.

    Expected container paths (copied by Dockerfile):
      /app/alembic.ini
      /app/migrations/
    """
    ini_path = Path("/app/alembic.ini")
    script_path = Path("/app/migrations")

    if not ini_path.exists():
        raise RuntimeError(f"Alembic config not found: {ini_path} (did Dockerfile copy it?)")
    if not script_path.exists():
        raise RuntimeError(
            f"Alembic script folder not found: {script_path} (did Dockerfile copy it?)"
        )

    cfg = Config(str(ini_path))
    cfg.set_main_option("script_location", str(script_path))
    cfg.set_main_option("prepend_sys_path", "/app")
    return cfg


def run_migrations(database_url: str) -> None:

    cfg = _alembic_config()
    cfg.set_main_option("sqlalchemy.url", _to_sync_database_url(database_url))
    alembic_command.upgrade(cfg, "head")


async def wait_for_db(
    engine: AsyncEngine, *, attempts: int = 30, delay_seconds: float = 1.0
) -> None:
    last_exc: Exception | None = None
    for _ in range(attempts):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            return
        except Exception as exc:
            last_exc = exc
            await asyncio.sleep(delay_seconds)

    raise RuntimeError("Database did not become ready in time") from last_exc
