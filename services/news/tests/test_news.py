from app.api import routes
from app.core.config import Settings
from app.main import create_app
from fastapi.testclient import TestClient


class FakeNewsApiClient:
    def __init__(self):
        self.calls = []

    def fetch_recent(self, symbol: str, limit: int):
        self.calls.append((symbol, limit))
        return [
            type(
                "A",
                (),
                {
                    "title": f"{symbol} headline",
                    "source": "Example",
                    "url": f"https://example.com/{symbol}",
                    "published_at": "2026-01-01T00:00:00Z",
                },
            )()
        ]

    def close(self):
        return None


def test_news_dedupes_and_normalizes_symbols():
    app = create_app(
        Settings(
            news_api_key="test",
            frontend_origin="http://localhost:5173",
            per_symbol_limit=5,
            log_level="INFO",
        )
    )

    fake = FakeNewsApiClient()
    app.dependency_overrides[routes.get_newsapi_client] = lambda: fake

    with TestClient(app) as client:
        resp = client.get("/api/news", params={"symbols": "aapl, AAPL , msft"})

    assert resp.status_code == 200
    data = resp.json()

    assert [c[0] for c in fake.calls] == ["AAPL", "MSFT"]
    assert len(data) == 2
    assert data[0]["title"] in ("AAPL headline", "MSFT headline")


def test_news_empty_symbols_returns_empty_list():
    app = create_app(
        Settings(
            news_api_key="test",
            frontend_origin="http://localhost:5173",
            per_symbol_limit=5,
            log_level="INFO",
        )
    )
    app.state.newsapi_client = FakeNewsApiClient()

    with TestClient(app) as client:
        resp = client.get("/api/news", params={"symbols": " ,  , "})

    assert resp.status_code == 200
    assert resp.json() == []
