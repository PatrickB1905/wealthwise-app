from __future__ import annotations

from typing import Any

import pandas as pd

import app.services.quotes as quotes_mod


def test_fetch_quotes_empty_input():
    assert quotes_mod.fetch_quotes([]) == []
    assert quotes_mod.fetch_quotes(["   ", ""]) == []


def test_fetch_quotes_single_symbol(monkeypatch: Any):
    df = pd.DataFrame({"Close": [100.0, 110.0]})

    def fake_download(**kwargs: Any):
        return df

    monkeypatch.setattr(quotes_mod.yf, "download", fake_download)
    out = quotes_mod.fetch_quotes(["aapl"])
    assert len(out) == 1
    assert out[0]["symbol"] == "AAPL"
    assert out[0]["currentPrice"] == 110.0
    assert round(out[0]["dailyChangePercent"], 6) == 10.0


def test_fetch_quotes_multi_symbol(monkeypatch: Any):
    cols = pd.MultiIndex.from_product([["AAPL", "MSFT"], ["Close"]])
    df = pd.DataFrame([[100.0, 50.0], [110.0, 55.0]], columns=cols)

    def fake_download(**kwargs: Any):
        return df

    monkeypatch.setattr(quotes_mod.yf, "download", fake_download)
    out = quotes_mod.fetch_quotes(["aapl", "msft"])
    assert {q["symbol"] for q in out} == {"AAPL", "MSFT"}


def test_fetch_quotes_handles_yfinance_exception(monkeypatch: Any):
    def boom(**kwargs: Any):
        raise RuntimeError("nope")

    monkeypatch.setattr(quotes_mod.yf, "download", boom)
    assert quotes_mod.fetch_quotes(["AAPL"]) == []
