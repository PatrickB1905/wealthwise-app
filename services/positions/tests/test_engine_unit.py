from __future__ import annotations

from typing import Any

import pytest
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool
from starlette.requests import Request

from app.db.engine import _to_async_database_url, get_session


def test_to_async_database_url_postgresql() -> None:
    assert (
        _to_async_database_url("postgresql://u:p@h:5432/db") == "postgresql+asyncpg://u:p@h:5432/db"
    )


def test_to_async_database_url_postgres_legacy() -> None:
    assert (
        _to_async_database_url("postgres://u:p@h:5432/db") == "postgresql+asyncpg://u:p@h:5432/db"
    )


def test_to_async_database_url_other_passthrough() -> None:
    assert _to_async_database_url("sqlite:///x.db") == "sqlite:///x.db"


@pytest.mark.asyncio
async def test_get_session_yields_async_session() -> None:
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
    try:
        SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

        app = FastAPI()
        app.state.db_sessionmaker = SessionLocal

        scope: dict[str, Any] = {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [],
            "app": app,
        }
        req = Request(scope)

        agen = get_session(req)
        session = await agen.__anext__()
        assert isinstance(session, AsyncSession)

        with pytest.raises(StopAsyncIteration):
            await agen.__anext__()
    finally:
        await engine.dispose()
