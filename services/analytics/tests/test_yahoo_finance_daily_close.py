from __future__ import annotations

from datetime import date

import pandas as pd
from app.clients.yahoo_finance import YahooFinanceClient


class _FakeTicker:
    def __init__(self, _ticker: str):
        self._ticker = _ticker

    def history(self, **_kwargs):
        return pd.DataFrame()


def test_fetch_daily_close_returns_empty_series_when_df_empty(monkeypatch):
    import yfinance as yf

    monkeypatch.setattr(yf, "Ticker", _FakeTicker)

    client = YahooFinanceClient()
    series = client.fetch_daily_close("MSFT", start=date(2025, 1, 1), end=date(2025, 2, 1))

    assert isinstance(series, pd.Series)
    assert series.empty
