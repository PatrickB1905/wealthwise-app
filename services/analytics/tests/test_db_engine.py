from __future__ import annotations

import sqlalchemy
from app.db.engine import build_engine


def test_build_engine_creates_engine():
    eng = build_engine("sqlite+pysqlite:///:memory:")
    try:
        assert isinstance(eng, sqlalchemy.engine.Engine)
        with eng.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
    finally:
        eng.dispose()


def test_build_engine_creates_engine_for_postgres_url_without_connecting():
    eng = build_engine("postgresql+asyncpg://user:pass@localhost:5432/dbname")
    try:
        assert isinstance(eng, sqlalchemy.engine.Engine)
    finally:
        eng.dispose()
