from __future__ import annotations

from app.core.config import Settings


def test_frontend_origins_defaults_to_frontend_origin():
    s = Settings(FRONTEND_ORIGIN="http://localhost:5173")
    assert s.frontend_origins == ["http://localhost:5173"]


def test_frontend_origins_parses_csv_and_trims():
    s = Settings(FRONTEND_ORIGINS=" http://a ,http://b,  ")
    assert s.frontend_origins == ["http://a", "http://b"]
