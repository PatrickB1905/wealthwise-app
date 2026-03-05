from __future__ import annotations

from app.core.config import Settings


def test_frontend_origins_falls_back_to_single_origin():
    s = Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET="test-secret-at-least-32-bytes-long-00000000",
        FRONTEND_ORIGIN=" http://localhost:5173 ",
        LOG_LEVEL="INFO",
    )
    assert s.frontend_origin == "http://localhost:5173"
    assert s.frontend_origins == ["http://localhost:5173"]


def test_frontend_origins_parses_csv_and_filters_blanks():
    s = Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET="test-secret-at-least-32-bytes-long-00000000",
        FRONTEND_ORIGIN="http://localhost:5173",
        FRONTEND_ORIGINS=" http://localhost:5173, ,http://127.0.0.1:5173 ",
        LOG_LEVEL="INFO",
    )
    assert s.frontend_origins == ["http://localhost:5173", "http://127.0.0.1:5173"]
