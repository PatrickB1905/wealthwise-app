from __future__ import annotations

import httpx
from app.api import routes
from app.core.config import Settings
from app.main import create_app
from fastapi.testclient import TestClient


def _http_status_error(code: int) -> httpx.HTTPStatusError:
    req = httpx.Request("GET", "http://positions/api/positions")
    resp = httpx.Response(code, request=req)
    return httpx.HTTPStatusError("boom", request=req, response=resp)


def test_summary_returns_401_when_positions_returns_401():
    class Repo401:
        def list_for_current_user(self, _auth: str):
            raise _http_status_error(401)

    class MarketDataNoop:
        def fetch_quotes(self, _symbols):
            return {}

    app = create_app(Settings())
    app.dependency_overrides[routes.get_positions_repo] = lambda: Repo401()
    app.dependency_overrides[routes.get_market_data_client] = lambda: MarketDataNoop()

    with TestClient(app) as client:
        r = client.get(
            "/api/analytics/summary",
            params={"userId": 1},
            headers={"Authorization": "Bearer x"},
        )

    assert r.status_code == 401


def test_summary_returns_503_when_positions_returns_500():
    class Repo500:
        def list_for_current_user(self, _auth: str):
            raise _http_status_error(500)

    class MarketDataNoop:
        def fetch_quotes(self, _symbols):
            return {}

    app = create_app(Settings())
    app.dependency_overrides[routes.get_positions_repo] = lambda: Repo500()
    app.dependency_overrides[routes.get_market_data_client] = lambda: MarketDataNoop()

    with TestClient(app) as client:
        r = client.get(
            "/api/analytics/summary",
            params={"userId": 1},
            headers={"Authorization": "Bearer x"},
        )

    assert r.status_code == 503
    assert "Positions unavailable" in r.text


def test_history_returns_503_when_positions_raises_generic_exception():
    class RepoBoom:
        def list_for_current_user(self, _auth: str):
            raise RuntimeError("boom")

    class FakeYF:
        def fetch_monthly_close(self, _ticker: str, _months: int):
            raise AssertionError("Yahoo should not be called if repo fails")

    app = create_app(Settings())
    app.dependency_overrides[routes.get_positions_repo] = lambda: RepoBoom()
    app.dependency_overrides[routes.get_yahoo_client] = lambda: FakeYF()

    with TestClient(app) as client:
        r = client.get(
            "/api/analytics/history",
            params={"months": 2},
            headers={"Authorization": "Bearer x"},
        )

    assert r.status_code == 503
    assert "Positions unavailable" in r.text


def test_ready_returns_503_when_positions_health_is_500():
    class DummyResp:
        def __init__(self, status_code: int):
            self.status_code = status_code

        def raise_for_status(self):
            if self.status_code >= 400:
                raise _http_status_error(self.status_code)

    class DummyHttp:
        def get(self, _url: str, **_kwargs):
            return DummyResp(500)

    app = create_app(Settings(POSITIONS_SERVICE_URL="http://positions:4000/api"))
    app.dependency_overrides[routes.get_http_client] = lambda: DummyHttp()

    with TestClient(app) as client:
        r = client.get("/api/ready")

    assert r.status_code == 503
