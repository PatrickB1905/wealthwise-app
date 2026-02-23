from fastapi.testclient import TestClient

from app.main import create_app


def test_health_ok():
    app = create_app()
    client = TestClient(app)

    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OK"
    assert "origin" in data