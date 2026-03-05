from __future__ import annotations

from datetime import datetime

from app.api import routes
from app.main import create_app
from app.repositories.positions import PositionRow
from fastapi.testclient import TestClient

DUMMY_AUTH = "Bearer test-token"


class RepoClosedOnly:
    def list_for_current_user(self, auth_header: str):
        assert auth_header.startswith("Bearer ")
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
    def list_for_current_user(self, auth_header: str):
        assert auth_header.startswith("Bearer ")
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
    def list_for_current_user(self, auth_header: str):
        assert auth_header.startswith("Bearer ")
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


def _make_client(repo, md):
    app = create_app()
    app.dependency_overrides[routes.require_auth_header] = lambda: DUMMY_AUTH
    app.dependency_overrides[routes.get_positions_repo] = lambda: repo
    app.dependency_overrides[routes.get_market_data_client] = lambda: md
    return TestClient(app)


def test_summary_closed_only():
    with _make_client(RepoClosedOnly(), MarketDataOk()) as client:
        resp = client.get("/api/analytics/summary")

    assert resp.status_code == 200
    body = resp.json()

    assert body["invested"] == 20.0
    assert body["totalPL"] == 10.0
    assert body["totalPLPercent"] == 50.0
    assert body["openCount"] == 0
    assert body["closedCount"] == 1


def test_summary_open_only_with_quotes():
    with _make_client(RepoOpenOnly(), MarketDataOk()) as client:
        resp = client.get("/api/analytics/summary")

    assert resp.status_code == 200
    body = resp.json()

    assert body["invested"] == 100.0
    assert body["totalPL"] == 20.0
    assert body["totalPLPercent"] == 20.0
    assert body["openCount"] == 1
    assert body["closedCount"] == 0


def test_summary_market_data_down_degrades_gracefully():
    with _make_client(RepoMixed(), MarketDataDown()) as client:
        resp = client.get("/api/analytics/summary")

    assert resp.status_code == 200
    body = resp.json()

    assert body["invested"] == 120.0
    assert body["totalPL"] == 10.0
    assert body["totalPLPercent"] == round(10.0 / 120.0 * 100.0, 2)
    assert body["openCount"] == 1
    assert body["closedCount"] == 1
