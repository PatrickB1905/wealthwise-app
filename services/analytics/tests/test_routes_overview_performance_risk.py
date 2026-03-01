from __future__ import annotations

from datetime import date, datetime, timedelta

import pandas as pd
from app.api import routes
from app.core.config import Settings
from app.main import create_app
from app.repositories.positions import PositionRow
from fastapi.testclient import TestClient

DUMMY_AUTH = "Bearer test-token"


class RepoOneOpen:
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


class MarketDataFixed:
    def fetch_quotes(self, symbols):
        assert "MSFT" in symbols
        return {"MSFT": 120.0}


class FakeYF:
    def fetch_daily_close(self, ticker: str, start: date, end: date) -> pd.Series:
        idx = pd.date_range(start=start, end=end - timedelta(days=1), freq="D")
        base = 100.0 if ticker != "SPY" else 200.0
        vals = [base + i for i in range(len(idx))]
        return pd.Series(vals, index=idx)


def _make_client():
    app = create_app(Settings(JWT_SECRET="secret", ANALYTICS_CACHE_TTL_SECONDS=60))

    app.dependency_overrides[routes.require_auth_header] = lambda: DUMMY_AUTH
    routes.get_current_user_id_from_request = lambda _req: 1  # type: ignore[assignment]

    app.dependency_overrides[routes.get_positions_repo] = lambda: RepoOneOpen()
    app.dependency_overrides[routes.get_market_data_client] = lambda: MarketDataFixed()
    app.dependency_overrides[routes.get_yahoo_client] = lambda: FakeYF()
    return TestClient(app)


def test_overview_returns_holdings_and_concentration():
    with _make_client() as client:
        r = client.get("/api/analytics/overview", headers={"Authorization": DUMMY_AUTH})
    assert r.status_code == 200
    body = r.json()
    assert body["summary"]["openCount"] == 1
    assert len(body["holdings"]) == 1
    assert body["holdings"][0]["ticker"] == "MSFT"
    assert body["concentration"]["top5WeightPercent"] >= 0.0


def test_performance_returns_points():
    with _make_client() as client:
        r = client.get(
            "/api/analytics/performance", params={"days": 30}, headers={"Authorization": DUMMY_AUTH}
        )
    assert r.status_code == 200
    body = r.json()
    assert body["days"] == 30
    assert len(body["points"]) > 0
    assert "portfolioValue" in body["points"][0]
    assert "cumulativeReturnPercent" in body["points"][0]


def test_risk_returns_metrics():
    with _make_client() as client:
        r = client.get(
            "/api/analytics/risk",
            params={"days": 30, "benchmark": "SPY"},
            headers={"Authorization": DUMMY_AUTH},
        )
    assert r.status_code == 200
    body = r.json()
    assert body["benchmark"] == "SPY"
    assert "volatilityAnnualized" in body
    assert "maxDrawdownPercent" in body
    assert "sharpeAnnualized" in body
    assert "beta" in body
    assert "correlation" in body
