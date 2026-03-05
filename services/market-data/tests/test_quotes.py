from __future__ import annotations

from dataclasses import dataclass

import pytest
from app.clients.yahoo_finance import QuoteData, YahooFinanceClient
from app.core.config import Settings
from app.main import create_app
from fastapi.testclient import TestClient


@dataclass(frozen=True)
class _FakeRow:
    symbol: str
    current_price: float
    daily_change_percent: float


def test_quotes_endpoint_maps_response_fields_and_uses_default_di(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    import app.services.quotes as quotes_mod

    def fake_compute(symbols: list[str]) -> dict[str, _FakeRow]:
        return {
            "AAPL": _FakeRow("AAPL", 123.0, 1.23),
            "MSFT": _FakeRow("MSFT", 234.0, 2.34),
        }

    monkeypatch.setattr(quotes_mod, "_compute_from_download", fake_compute)

    def fake_fetch_quote(self: YahooFinanceClient, symbol: str) -> QuoteData | None:
        sym = symbol.strip().upper()
        return QuoteData(symbol=sym, current_price=0.0, daily_change_percent=0.0, logo_url="x")

    monkeypatch.setattr(YahooFinanceClient, "fetch_quote", fake_fetch_quote)

    app = create_app(Settings(max_symbols=50))
    with TestClient(app) as client:
        r = client.get("/api/quotes", params={"symbols": "AAPL,MSFT"})

    assert r.status_code == 200
    data = r.json()
    assert {d["symbol"] for d in data} == {"AAPL", "MSFT"}
    assert all("currentPrice" in d for d in data)
    assert all("dailyChangePercent" in d for d in data)
    assert all("logoUrl" in d for d in data)


def test_quotes_endpoint_respects_max_symbols(monkeypatch: pytest.MonkeyPatch) -> None:
    import app.services.quotes as quotes_mod

    def fake_compute(symbols: list[str]) -> dict[str, _FakeRow]:
        # Pretend all symbols returned prices
        return {s: _FakeRow(s, 1.0, 0.0) for s in symbols}

    monkeypatch.setattr(quotes_mod, "_compute_from_download", fake_compute)

    monkeypatch.setattr(
        YahooFinanceClient,
        "fetch_quote",
        lambda self, symbol: QuoteData(
            symbol=symbol, current_price=0.0, daily_change_percent=0.0, logo_url="x"
        ),
    )

    app = create_app(Settings(MARKET_DATA_MAX_SYMBOLS=2))
    with TestClient(app) as client:
        r = client.get("/api/quotes", params={"symbols": "AAPL,MSFT,GOOG,TSLA"})

    assert r.status_code == 200
    data = r.json()
    assert [d["symbol"] for d in data] == ["AAPL", "MSFT"]
