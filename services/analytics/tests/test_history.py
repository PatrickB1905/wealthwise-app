from fastapi.testclient import TestClient

from app.main import create_app
from app.api import routes


class FakeRepo:
    def list_by_user(self, user_id: int):
        return []


class FakeYF:
    def fetch_monthly_close(self, ticker: str, months: int):
        raise AssertionError("Should not be called for empty positions")


def test_history_empty_positions():
    app = create_app()
    app.dependency_overrides[routes.get_positions_repo] = lambda: FakeRepo()
    app.dependency_overrides[routes.get_yahoo_client] = lambda: FakeYF()

    client = TestClient(app)
    resp = client.get("/api/analytics/history", params={"userId": 1, "months": 12})
    assert resp.status_code == 200
    assert resp.json() == []