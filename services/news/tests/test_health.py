from app.core.config import Settings
from app.main import create_app
from fastapi.testclient import TestClient


def test_health_ok():
    app = create_app(
        Settings(
            news_api_key="test",
            frontend_origin="http://localhost:5173",
            port=6500,
            log_level="INFO",
        )
    )

    with TestClient(app) as client:
        resp = client.get("/api/health")

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "OK"
    assert "origin" in body
