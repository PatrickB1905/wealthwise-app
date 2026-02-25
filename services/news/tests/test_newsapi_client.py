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
        c.fetch_recent("AAPL", 5)
