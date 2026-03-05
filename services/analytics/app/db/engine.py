from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.pool import NullPool


def build_engine(database_url: str) -> Engine:
    url = make_url(database_url)

    if url.drivername.startswith("sqlite"):
        return create_engine(
            database_url,
            future=True,
            pool_pre_ping=True,
            poolclass=NullPool,
        )

    return create_engine(
        database_url,
        future=True,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_timeout=10,
        pool_recycle=1800,
    )
