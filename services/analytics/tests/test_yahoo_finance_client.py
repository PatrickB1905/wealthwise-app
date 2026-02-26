from __future__ import annotations

import pandas as pd
from app.clients.yahoo_finance import YahooFinanceClient


def test_yahoo_finance_client_returns_empty_series_on_failure(monkeypatch):
    import yfinance as yf

    class DummyTicker:
        def history(self, *args, **kwargs):
            raise RuntimeError("boom")

    monkeypatch.setattr(yf, "Ticker", lambda _ticker: DummyTicker())

    c = YahooFinanceClient()
    s = c.fetch_monthly_close("MSFT", 2)
    assert isinstance(s, pd.Series)
    assert s.empty


def test_yahoo_finance_client_happy_path_normalizes_index_and_drops_tz(monkeypatch):
    """
    Covers the happy path and timezone-aware index branch:
    - df["Close"] exists
    - timezone is stripped via tz_convert(None)
    - index normalized to midnight
    """
    import yfinance as yf

    idx = pd.date_range(end=pd.Timestamp.now(tz="UTC"), periods=2, freq="ME", tz="UTC")
    df = pd.DataFrame({"Close": [110.0, 120.0]}, index=idx)

    class DummyTicker:
        def history(self, *args, **kwargs):
            return df

    monkeypatch.setattr(yf, "Ticker", lambda _ticker: DummyTicker())

    c = YahooFinanceClient()
    s = c.fetch_monthly_close("MSFT", 2)

    assert isinstance(s, pd.Series)
    assert len(s) == 2
    assert s.index.tz is None
    assert all(ts == ts.normalize() for ts in s.index)
