from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import pandas as pd
import pytest
from app.clients.yahoo_finance import QuoteData, YahooFinanceClient
from app.services import quotes as quotes_mod


@dataclass(frozen=True)
class _Row:
    symbol: str
    current_price: float
    daily_change_percent: float


class _ClientOk(YahooFinanceClient):
    def __init__(self, logo_url: str = "https://logo.clearbit.com/example.com") -> None:
        self._logo_url = logo_url

    def fetch_quote(self, symbol: str) -> QuoteData | None:
        sym = symbol.strip().upper()
        if not sym:
            return None
        return QuoteData(
            symbol=sym,
            current_price=0.0,
            daily_change_percent=0.0,
            logo_url=self._logo_url,
        )


class _ClientBoom(YahooFinanceClient):
    def fetch_quote(self, symbol: str) -> QuoteData | None:
        raise RuntimeError("boom")


def test_parse_symbols_dedupes_trims_uppercases_and_limits() -> None:
    assert quotes_mod.parse_symbols(" aapl ,MSFT, aapl,,  ", max_symbols=50) == ["AAPL", "MSFT"]
    assert quotes_mod.parse_symbols("AAPL,MSFT,GOOG,TSLA", max_symbols=2) == ["AAPL", "MSFT"]
    assert quotes_mod.parse_symbols(",,   ,", max_symbols=10) == []


def test_cache_put_get_hit_and_expiry(monkeypatch: pytest.MonkeyPatch) -> None:
    q = QuoteData(symbol="AAPL", current_price=1.0, daily_change_percent=2.0, logo_url="logo")
    quotes_mod._cache_put(q, now=100.0)

    assert quotes_mod._cache_get("AAPL", now=100.0) == q

    expired = quotes_mod._cache_get("AAPL", now=100.0 + quotes_mod._CACHE_TTL_SECONDS + 0.01)
    assert expired is None
    assert "AAPL" not in quotes_mod._CACHE
    assert "AAPL" not in quotes_mod._CACHE_TS


def test_compute_from_download_single_symbol_happy_path(monkeypatch: pytest.MonkeyPatch) -> None:
    import yfinance as yf

    df = pd.DataFrame({"Close": [100.0, 110.0]})
    monkeypatch.setattr(yf, "download", lambda **kwargs: df)

    out = quotes_mod._compute_from_download(["AAPL"])
    assert set(out.keys()) == {"AAPL"}
    assert out["AAPL"].current_price == 110.0
    assert out["AAPL"].daily_change_percent == 10.0


def test_compute_from_download_single_symbol_not_enough_closes(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    import yfinance as yf

    df = pd.DataFrame({"Close": [100.0]})
    monkeypatch.setattr(yf, "download", lambda **kwargs: df)

    assert quotes_mod._compute_from_download(["AAPL"]) == {}


def test_compute_from_download_single_symbol_exception_returns_empty(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    import yfinance as yf

    class Bad:
        def __getitem__(self, key: str) -> Any:
            raise KeyError("nope")

    monkeypatch.setattr(yf, "download", lambda **kwargs: Bad())

    assert quotes_mod._compute_from_download(["AAPL"]) == {}


def test_compute_from_download_multi_symbol_happy_path(monkeypatch: pytest.MonkeyPatch) -> None:
    import yfinance as yf

    cols = pd.MultiIndex.from_product([["AAPL", "MSFT"], ["Close"]])
    df = pd.DataFrame([[100.0, 200.0], [110.0, 210.0]], columns=cols)
    monkeypatch.setattr(yf, "download", lambda **kwargs: df)

    out = quotes_mod._compute_from_download(["AAPL", "MSFT"])
    assert set(out.keys()) == {"AAPL", "MSFT"}
    assert out["AAPL"].current_price == 110.0
    assert out["AAPL"].daily_change_percent == 10.0
    assert out["MSFT"].current_price == 210.0
    assert out["MSFT"].daily_change_percent == 5.0


def test_fetch_quotes_returns_empty_when_no_symbols() -> None:
    out = quotes_mod.fetch_quotes(" , , ", client=_ClientOk(), max_symbols=10)
    assert out == []


def test_fetch_quotes_uses_cache_when_download_missing_rows(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Put cached quote
    cached = QuoteData(
        symbol="AAPL", current_price=9.0, daily_change_percent=9.0, logo_url="cached"
    )
    quotes_mod._cache_put(cached, now=100.0)

    # No download rows -> should return cached for AAPL
    monkeypatch.setattr(quotes_mod, "_compute_from_download", lambda symbols: {})

    # Freeze time used by fetch_quotes
    monkeypatch.setattr(quotes_mod.time, "time", lambda: 100.0)

    out = quotes_mod.fetch_quotes("AAPL", client=_ClientOk(), max_symbols=10)
    assert out == [cached]


def test_fetch_quotes_logo_falls_back_to_cached_on_client_exception(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # cached logo should be used if client.fetch_quote raises
    cached = QuoteData(
        symbol="AAPL", current_price=1.0, daily_change_percent=1.0, logo_url="cached-logo"
    )
    quotes_mod._cache_put(cached, now=100.0)

    # fetch_quotes will try client.fetch_quote
    monkeypatch.setattr(
        quotes_mod,
        "_compute_from_download",
        lambda symbols: {"AAPL": _Row("AAPL", 123.0, 1.23)},
    )
    monkeypatch.setattr(quotes_mod.time, "time", lambda: 100.0)

    out = quotes_mod.fetch_quotes("AAPL", client=_ClientBoom(), max_symbols=10)
    assert len(out) == 1
    assert out[0].symbol == "AAPL"
    assert out[0].logo_url == "cached-logo"


def test_fetch_quotes_cache_written_on_success(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        quotes_mod,
        "_compute_from_download",
        lambda symbols: {"AAPL": _Row("AAPL", 123.0, 1.23)},
    )
    monkeypatch.setattr(quotes_mod.time, "time", lambda: 100.0)

    out = quotes_mod.fetch_quotes("AAPL", client=_ClientOk(logo_url="logo-1"), max_symbols=10)
    assert len(out) == 1
    assert quotes_mod._CACHE["AAPL"].logo_url == "logo-1"
    assert quotes_mod._CACHE_TS["AAPL"] == 100.0
