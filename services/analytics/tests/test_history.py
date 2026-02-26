from __future__ import annotations

from datetime import datetime

import pandas as pd
from app.api import routes
from app.main import create_app
from app.repositories.positions import PositionRow
from fastapi.testclient import TestClient

DUMMY_AUTH = "Bearer test-token"


class RepoSimple:
    def list_for_current_user(self, auth_header: str):
        assert auth_header.startswith("Bearer ")
        return [
            PositionRow(
                quantity=1,
                buy_price=100.0,
                sell_price=None,
                sell_date=None,
                ticker="MSFT",
                buy_date=datetime(2024, 1, 1),
            )
        ]


class RepoBuyAfterEnd:
    def list_for_current_user(self, auth_header: str):
        assert auth_header.startswith("Bearer ")
        return [
            PositionRow(
                quantity=1,
                buy_price=100.0,
                sell_price=None,
                sell_date=None,
                ticker="MSFT",
                buy_date=datetime(2100, 1, 1),
            )
        ]


class FakeYF:
    def fetch_monthly_close(self, ticker: str, months: int) -> pd.Series:
        now = pd.Timestamp.now().normalize()
        idx = pd.date_range(end=now, periods=2, freq="ME")
        return pd.Series([110.0, 120.0], index=idx)


def _make_client_with_overrides(repo, yf):
    app = create_app()

    app.dependency_overrides[routes.require_auth_header] = lambda: DUMMY_AUTH

    app.dependency_overrides[routes.get_positions_repo] = lambda: repo
    app.dependency_overrides[routes.get_yahoo_client] = lambda: yf

    return TestClient(app)


def test_history_empty_positions():
    class RepoEmpty:
        def list_for_current_user(self, auth_header: str):
            assert auth_header.startswith("Bearer ")
            return []

    with _make_client_with_overrides(RepoEmpty(), FakeYF()) as client:
        resp = client.get("/api/analytics/history", params={"months": 2})

    assert resp.status_code == 200
    assert resp.json() == []


def test_history_open_position_uses_last_close():
    with _make_client_with_overrides(RepoSimple(), FakeYF()) as client:
        resp = client.get("/api/analytics/history", params={"months": 2})

    assert resp.status_code == 200
    data = resp.json()

    assert len(data) == 2
    assert data[0]["value"] in (10.0, 20.0)
    assert data[1]["value"] in (10.0, 20.0)
    assert {data[0]["value"], data[1]["value"]} == {10.0, 20.0}


def test_history_buy_after_window_contributes_zero():
    with _make_client_with_overrides(RepoBuyAfterEnd(), FakeYF()) as client:
        resp = client.get("/api/analytics/history", params={"months": 2})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["value"] == 0.0
    assert data[1]["value"] == 0.0
