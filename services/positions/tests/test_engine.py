from __future__ import annotations

import asyncio

from app.db.engine import _to_async_database_url, create_engine_and_sessionmaker


def test_to_async_database_url_converts_postgresql():
    assert (
        _to_async_database_url("postgresql://u:p@localhost:5432/db")
        == "postgresql+asyncpg://u:p@localhost:5432/db"
    )


def test_to_async_database_url_converts_postgres():
    assert (
        _to_async_database_url("postgres://u:p@localhost:5432/db")
        == "postgresql+asyncpg://u:p@localhost:5432/db"
    )


def test_to_async_database_url_passthrough_other_schemes():
    assert _to_async_database_url("sqlite:///tmp.db") == "sqlite:///tmp.db"


def test_create_engine_and_sessionmaker_uses_asyncpg_url():
    engine, sessionmaker = create_engine_and_sessionmaker("postgresql://u:p@localhost:5432/db")
    assert "asyncpg" in str(engine.url)
    assert sessionmaker is not None
    asyncio.run(engine.dispose())
