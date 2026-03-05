from __future__ import annotations

import httpx
from app.api import routes
from app.core.config import Settings
from app.main import create_app
from fastapi.testclient import TestClient


class DummyResp:
    def __init__(self, status_code: int = 200):
        self.status_code = status_code

    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError(
                "boom",
                request=httpx.Request("GET", "http://x"),
                response=httpx.Response(self.status_code),
            )


class DummyHttp:
    def __init__(self, status_code: int = 200, raise_conn: bool = False):
        self._status_code = status_code
        self._raise_conn = raise_conn
        self.calls: list[str] = []

    def get(self, url: str, **_kwargs):
        self.calls.append(url)
        if self._raise_conn:
            raise OSError("connection refused")
        return DummyResp(self._status_code)


def test_require_auth_header_missing_returns_401():
    app = create_app(Settings())
    with TestClient(app) as client:
        r = client.get("/api/analytics/history", params={"months": 2})
    assert r.status_code == 401
    assert "Missing Authorization" in r.text


def test_require_auth_header_invalid_returns_401():
    app = create_app(Settings())
    with TestClient(app) as client:
        r = client.get(
            "/api/analytics/history",
            params={"months": 2},
            headers={"Authorization": "Basic abc"},
        )
    assert r.status_code == 401
    assert "Invalid Authorization" in r.text


def test_ready_returns_200_when_positions_health_ok():
    app = create_app(Settings(POSITIONS_SERVICE_URL="http://positions:4000/api"))
    app.dependency_overrides[routes.get_http_client] = lambda: DummyHttp(status_code=200)

    with TestClient(app) as client:
        r = client.get("/api/ready")

    assert r.status_code == 200
    assert r.json()["status"] == "READY"


def test_ready_returns_503_when_positions_unreachable():
    app = create_app(Settings(POSITIONS_SERVICE_URL="http://positions:4000/api"))
    app.dependency_overrides[routes.get_http_client] = lambda: DummyHttp(raise_conn=True)

    with TestClient(app) as client:
        r = client.get("/api/ready")

    assert r.status_code == 503
    assert "Positions service unavailable" in r.text
