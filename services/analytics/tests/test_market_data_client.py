import httpx
import pytest
from app.clients.market_data import MarketDataClient


def test_market_data_client_empty_symbols_returns_empty():
    c = MarketDataClient("http://example", timeout_seconds=0.01)
    assert c.fetch_quotes(set()) == {}


def test_market_data_client_raises_runtime_error_on_http_failure(monkeypatch):
    c = MarketDataClient("http://example", timeout_seconds=0.01)

    class DummyResponse:
        def raise_for_status(self):
            raise httpx.HTTPStatusError("boom", request=None, response=None)

        def json(self):
            return []

    class DummyClient:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def get(self, *args, **kwargs):
            return DummyResponse()

    monkeypatch.setattr(httpx, "Client", DummyClient)

    with pytest.raises(RuntimeError):
        c.fetch_quotes({"MSFT"})
