from datetime import datetime

import pandas as pd
from app.api import routes
from app.main import create_app
from app.repositories.positions import PositionRow
from fastapi.testclient import TestClient


class RepoSimple:
    def list_by_user(self, user_id: int):
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
    def list_by_user(self, user_id: int):
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


def test_history_empty_positions():
    class RepoEmpty:
        def list_by_user(self, user_id: int):
            return []

    app = create_app()
    app.dependency_overrides[routes.get_positions_repo] = lambda: RepoEmpty()
    app.dependency_overrides[routes.get_yahoo_client] = lambda: FakeYF()

    with TestClient(app) as client:
        resp = client.get("/api/analytics/history", params={"userId": 1, "months": 2})

    assert resp.status_code == 200
    assert resp.json() == []


def test_history_open_position_uses_last_close():
    app = create_app()
    app.dependency_overrides[routes.get_positions_repo] = lambda: RepoSimple()
    app.dependency_overrides[routes.get_yahoo_client] = lambda: FakeYF()

    with TestClient(app) as client:
        resp = client.get("/api/analytics/history", params={"userId": 1, "months": 2})

    assert resp.status_code == 200
    data = resp.json()

    assert len(data) == 2
    assert data[0]["value"] in (10.0, 20.0)
    assert data[1]["value"] in (10.0, 20.0)
    assert set([data[0]["value"], data[1]["value"]]) == {10.0, 20.0}


def test_history_buy_after_window_contributes_zero():
    app = create_app()
    app.dependency_overrides[routes.get_positions_repo] = lambda: RepoBuyAfterEnd()
    app.dependency_overrides[routes.get_yahoo_client] = lambda: FakeYF()

    with TestClient(app) as client:
        resp = client.get("/api/analytics/history", params={"userId": 1, "months": 2})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["value"] == 0.0
    assert data[1]["value"] == 0.0
