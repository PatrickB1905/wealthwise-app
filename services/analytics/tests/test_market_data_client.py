import httpx
import pytest
from app.clients.market_data import MarketDataClient


def test_market_data_client_empty_symbols_returns_empty():
    with httpx.Client() as http:
        c = MarketDataClient("http://example", http=http, timeout_seconds=0.01)
        assert c.fetch_quotes(set()) == {}


def test_market_data_client_raises_runtime_error_on_http_failure(monkeypatch):
    class DummyResponse:
        def raise_for_status(self):
            raise httpx.HTTPStatusError("boom", request=None, response=None)

        def json(self):
            return []

    class DummyClient:
        def __init__(self, *args, **kwargs):
            pass

        def get(self, *args, **kwargs):
            return DummyResponse()

    http = DummyClient()

    c = MarketDataClient("http://example", http=http, timeout_seconds=0.01, retries=0)

    with pytest.raises(RuntimeError):
        c.fetch_quotes({"MSFT"})
