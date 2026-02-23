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
