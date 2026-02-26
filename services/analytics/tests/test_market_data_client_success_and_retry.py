from __future__ import annotations

import httpx
import pytest
from app.clients.market_data import MarketDataClient


class RespOK:
    def raise_for_status(self):
        return None

    def json(self):
        return [{"symbol": "MSFT", "currentPrice": 123.45}]


class RespFail:
    def raise_for_status(self):
        raise httpx.HTTPStatusError(
            "boom",
            request=httpx.Request("GET", "http://x"),
            response=httpx.Response(500),
        )

    def json(self):
        return []


class HttpFlakyThenOk:
    def __init__(self):
        self.calls = 0

    def get(self, *_args, **_kwargs):
        self.calls += 1
        if self.calls == 1:
            return RespFail()
        return RespOK()


def test_market_data_client_retries_then_succeeds(monkeypatch):
    monkeypatch.setattr("time.sleep", lambda *_args, **_kwargs: None)

    http = HttpFlakyThenOk()
    c = MarketDataClient("http://example", http=http, timeout_seconds=0.01, retries=1)

    out = c.fetch_quotes({"MSFT"})
    assert out["MSFT"] == pytest.approx(123.45)
    assert http.calls == 2
