from __future__ import annotations

import pytest

import app.db.migrations as mig


def test_to_sync_database_url_conversions():
    assert (
        mig._to_sync_database_url("postgresql+asyncpg://u:p@h:5432/db")
        == "postgresql+psycopg://u:p@h:5432/db"
    )
    assert (
        mig._to_sync_database_url("postgresql://u:p@h:5432/db")
        == "postgresql+psycopg://u:p@h:5432/db"
    )
    assert (
        mig._to_sync_database_url("postgres://u:p@h:5432/db")
        == "postgresql+psycopg://u:p@h:5432/db"
    )
    assert mig._to_sync_database_url("sqlite:///tmp.db") == "sqlite:///tmp.db"


def test_alembic_config_raises_when_missing_files(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(mig.Path, "exists", lambda self: False)
    with pytest.raises(RuntimeError):
        mig._alembic_config()


@pytest.mark.asyncio
async def test_wait_for_db_raises_after_attempts(monkeypatch: pytest.MonkeyPatch):
    class FakeConn:
        async def execute(self, *_args, **_kwargs):
            raise RuntimeError("db down")

    class FakeEngine:
        def connect(self):
            class CM:
                async def __aenter__(self_inner):
                    return FakeConn()

                async def __aexit__(self_inner, exc_type, exc, tb):
                    return False

            return CM()

    engine = FakeEngine()
    with pytest.raises(RuntimeError):
        await mig.wait_for_db(engine=engine, attempts=2, delay_seconds=0.0)
