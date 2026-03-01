from __future__ import annotations

from app.core.config import Settings, _split_csv


def test_split_csv_trims_and_drops_empty() -> None:
    assert _split_csv("a, b, ,c,,") == ["a", "b", "c"]


def test_frontend_origins_uses_csv_when_provided() -> None:
    s = Settings(FRONTEND_ORIGIN="http://one", FRONTEND_ORIGINS="http://a, http://b")
    assert s.frontend_origins == ["http://a", "http://b"]


def test_frontend_origins_falls_back_to_single_origin() -> None:
    s = Settings(FRONTEND_ORIGIN="http://only")
    assert s.frontend_origins == ["http://only"]
