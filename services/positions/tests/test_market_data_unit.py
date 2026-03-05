from __future__ import annotations

import json
from typing import Any
from urllib.error import URLError

import app.services.market_data as md


class _FakeResp:
    def __init__(self, payload: Any) -> None:
        self._raw = json.dumps(payload).encode("utf-8")

    def read(self) -> bytes:
        return self._raw

    def __enter__(self) -> _FakeResp:
        return self

    def __exit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        return None


def test_build_quotes_url_encodes_symbols() -> None:
    url = md._build_quotes_url("http://x/api", ["AAPL", "MSFT"])
    assert url.startswith("http://x/api/quotes?")
    assert "symbols=AAPL%2CMSFT" in url


def test_fetch_quotes_from_market_data_returns_dicts(monkeypatch: Any) -> None:
    def fake_urlopen(req: Any, timeout: int) -> _FakeResp:
        assert timeout == 10
        return _FakeResp(
            [
                {"symbol": "AAPL", "currentPrice": 1.0, "dailyChangePercent": 0.1},
                "nope",
                {"symbol": "MSFT", "currentPrice": 2.0, "dailyChangePercent": -0.2},
            ]
        )

    monkeypatch.setattr(md.urllib.request, "urlopen", fake_urlopen)

    out = md.fetch_quotes_from_market_data("http://market/api", ["AAPL", "MSFT"])
    assert isinstance(out, list)
    assert len(out) == 2
    assert all(isinstance(x, dict) for x in out)


def test_fetch_quotes_from_market_data_handles_non_list(monkeypatch: Any) -> None:
    def fake_urlopen(req: Any, timeout: int) -> _FakeResp:
        return _FakeResp({"oops": True})

    monkeypatch.setattr(md.urllib.request, "urlopen", fake_urlopen)

    out = md.fetch_quotes_from_market_data("http://market/api", ["AAPL"])
    assert out == []


def test_fetch_quotes_from_market_data_handles_error(monkeypatch: Any) -> None:
    def fake_urlopen(req: Any, timeout: int) -> Any:
        raise URLError("boom")

    monkeypatch.setattr(md.urllib.request, "urlopen", fake_urlopen)

    out = md.fetch_quotes_from_market_data("http://market/api", ["AAPL"])
    assert out == []


def test_fetch_quotes_from_market_data_empty_symbols() -> None:
    assert md.fetch_quotes_from_market_data("http://market/api", []) == []
