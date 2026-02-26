from __future__ import annotations

from app.main import create_app
from fastapi.testclient import TestClient


def test_health_ok():
    app = create_app()
    with TestClient(app) as client:
        resp = client.get("/api/health")

    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OK"
    assert "origin" in data
