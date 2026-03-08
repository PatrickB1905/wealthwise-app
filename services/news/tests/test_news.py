from app.api import routes
from app.core.config import Settings
from app.main import create_app
from fastapi.testclient import TestClient


class FakeNewsApiClient:
    def __init__(self):
        self.calls = []

    def fetch_recent(self, query: str, limit: int):
        self.calls.append((query, limit))

        if '"AMZN"' in query:
            return [
                type(
                    "A",
                    (),
                    {
                        "title": "What Makes Amazon (AMZN) an Overall High-Quality Growth Compounder",
                        "source": "Seeking Alpha",
                        "url": "https://example.com/amzn-good",
                        "published_at": "2026-03-01T00:00:00Z",
                    },
                )(),
                type(
                    "A",
                    (),
                    {
                        "title": "Saipan 2025 1080p AMZN WEB-DL H264-MADSKY",
                        "source": "Bad Source",
                        "url": "https://example.com/amzn-bad",
                        "published_at": "2026-03-01T00:00:00Z",
                    },
                )(),
            ]

        return [
            type(
                "A",
                (),
                {
                    "title": "MSFT stock rises after earnings beat expectations",
                    "source": "Reuters",
                    "url": "https://example.com/msft-good",
                    "published_at": "2026-03-01T00:00:00Z",
                },
            )()
        ]

    def close(self):
        return None


def test_news_filters_obvious_garbage_and_normalizes_symbols():
    app = create_app(
        Settings(
            news_api_key="test",
            frontend_origin="http://localhost:5173",
            per_symbol_limit=5,
            minimum_article_score=3,
            log_level="INFO",
        )
    )

    fake = FakeNewsApiClient()
    app.dependency_overrides[routes.get_newsapi_client] = lambda: fake

    with TestClient(app) as client:
        resp = client.get("/api/news", params={"symbols": "amzn, AMZN, msft"})

    assert resp.status_code == 200
    data = resp.json()

    assert len(fake.calls) == 2
    assert any('"AMZN"' in call[0] for call in fake.calls)
    assert any('"MSFT"' in call[0] for call in fake.calls)

    titles = [item["title"] for item in data]
    assert "Saipan 2025 1080p AMZN WEB-DL H264-MADSKY" not in titles
    assert any("Amazon" in title or "MSFT" in title for title in titles)


def test_news_empty_symbols_returns_empty_list():
    app = create_app(
        Settings(
            news_api_key="test",
            frontend_origin="http://localhost:5173",
            per_symbol_limit=5,
            minimum_article_score=3,
            log_level="INFO",
        )
    )
    app.state.newsapi_client = FakeNewsApiClient()

    with TestClient(app) as client:
        resp = client.get("/api/news", params={"symbols": " ,  , "})

    assert resp.status_code == 200
    assert resp.json() == []
