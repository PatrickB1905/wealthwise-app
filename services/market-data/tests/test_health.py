from __future__ import annotations

from app.core.config import Settings
from app.main import create_app
from fastapi.testclient import TestClient


def test_health_ok() -> None:
    app = create_app(Settings())
    with TestClient(app) as client:
        resp = client.get("/api/health")

    assert resp.status_code == 200
    assert resp.json() == {"status": "OK"}
