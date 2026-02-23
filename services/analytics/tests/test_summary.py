from datetime import datetime

from fastapi.testclient import TestClient

from app.api import routes
from app.main import create_app
from app.repositories.positions import PositionRow


class RepoClosedOnly:
    def list_by_user(self, user_id: int):
        return [
            PositionRow(
                quantity=2,
                buy_price=10.0,
                sell_price=15.0,
                sell_date=datetime(2025, 1, 10),
                ticker="AAPL",
                buy_date=datetime(2025, 1, 1),
            )
        ]


class RepoOpenOnly:
    def list_by_user(self, user_id: int):
        return [
            PositionRow(
                quantity=1,
                buy_price=100.0,
                sell_price=None,
                sell_date=None,
                ticker="MSFT",
                buy_date=datetime(2025, 1, 1),
            )
        ]


class RepoMixed:
    def list_by_user(self, user_id: int):
        return [
            PositionRow(2, 10.0, 15.0, datetime(2025, 1, 10), "AAPL", datetime(2025, 1, 1)),
            PositionRow(1, 100.0, None, None, "MSFT", datetime(2025, 1, 1)),
        ]


class MarketDataOk:
    def fetch_quotes(self, symbols):
        return {"MSFT": 120.0}


class MarketDataDown:
    def fetch_quotes(self, symbols):
        raise RuntimeError("Market data unavailable")


def test_summary_closed_only():
    app = create_app()
    app.dependency_overrides[routes.get_positions_repo] = lambda: RepoClosedOnly()
    app.dependency_overrides[routes.get_market_data_client] = lambda: MarketDataOk()

    client = TestClient(app)
    resp = client.get("/api/analytics/summary", params={"userId": 1})
    assert resp.status_code == 200
    body = resp.json()

    assert body["invested"] == 20.0
    assert body["totalPL"] == 10.0
    assert body["totalPLPercent"] == 50.0
    assert body["openCount"] == 0
    assert body["closedCount"] == 1


def test_summary_open_only_with_quotes():
    app = create_app()
    app.dependency_overrides[routes.get_positions_repo] = lambda: RepoOpenOnly()
    app.dependency_overrides[routes.get_market_data_client] = lambda: MarketDataOk()

    client = TestClient(app)
    resp = client.get("/api/analytics/summary", params={"userId": 1})
    assert resp.status_code == 200
    body = resp.json()

    assert body["invested"] == 100.0
    assert body["totalPL"] == 20.0
    assert body["totalPLPercent"] == 20.0
    assert body["openCount"] == 1
    assert body["closedCount"] == 0


def test_summary_market_data_down_degrades_gracefully():
    app = create_app()
    app.dependency_overrides[routes.get_positions_repo] = lambda: RepoMixed()
    app.dependency_overrides[routes.get_market_data_client] = lambda: MarketDataDown()

    client = TestClient(app)
    resp = client.get("/api/analytics/summary", params={"userId": 1})
    assert resp.status_code == 200
    body = resp.json()

    assert body["invested"] == 120.0
    assert body["totalPL"] == 10.0
    assert body["totalPLPercent"] == round(10.0 / 120.0 * 100.0, 2)
    assert body["openCount"] == 1
    assert body["closedCount"] == 1