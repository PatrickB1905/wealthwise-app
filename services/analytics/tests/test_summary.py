from fastapi.testclient import TestClient

from app.main import create_app
from app.api import routes


class FakeRepo:
    def list_by_user(self, user_id: int):
        return []


class FakeMarketData:
    def fetch_quotes(self, symbols):
        return {}


def test_summary_empty_positions():
    app = create_app()

    app.dependency_overrides[routes.get_positions_repo] = lambda: FakeRepo()
    app.dependency_overrides[routes.get_market_data_client] = lambda: FakeMarketData()

    client = TestClient(app)
    resp = client.get("/api/analytics/summary", params={"userId": 1})
    assert resp.status_code == 200
    body = resp.json()
    assert body["invested"] == 0.0
    assert body["totalPL"] == 0.0
    assert body["totalPLPercent"] == 0.0
    assert body["openCount"] == 0
    assert body["closedCount"] == 0