from app.api import routes
from app.main import create_app
from fastapi.testclient import TestClient


class DummyConn:
    def exec_driver_sql(self, _sql: str):
        return 1

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class DummyEngine:
    def connect(self):
        return DummyConn()


def test_health_ok():
    app = create_app()
    app.dependency_overrides[routes.get_db_engine] = lambda: DummyEngine()

    with TestClient(app) as client:
        resp = client.get("/api/health")

    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OK"
    assert "origin" in data
