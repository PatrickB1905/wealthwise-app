import pytest
from app.clients.newsapi import NewsApiClient


def test_newsapi_client_non_200_raises():
    class DummyResp:
        status_code = 500
        text = "boom"

        def json(self):
            return {}

    class DummyHttp:
        def get(self, *_args, **_kwargs):
            return DummyResp()

        def close(self):
            return None

    c = NewsApiClient(api_key="x", http=DummyHttp(), timeout_seconds=0.01)
    with pytest.raises(RuntimeError):
        c.fetch_recent("AAPL stock", 5)


def test_newsapi_client_maps_articles():
    class DummyResp:
        status_code = 200
        text = "ok"

        def json(self):
            return {
                "articles": [
                    {
                        "title": "Amazon stock jumps after earnings",
                        "source": {"name": "Reuters"},
                        "url": "https://example.com/article",
                        "publishedAt": "2026-03-01T00:00:00Z",
                    }
                ]
            }

    class DummyHttp:
        def get(self, *_args, **_kwargs):
            return DummyResp()

        def close(self):
            return None

    c = NewsApiClient(api_key="x", http=DummyHttp(), timeout_seconds=0.01)
    items = c.fetch_recent("AMZN stock", 5)

    assert len(items) == 1
    assert items[0].title == "Amazon stock jumps after earnings"
    assert items[0].source == "Reuters"
