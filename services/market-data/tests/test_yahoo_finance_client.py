import pandas as pd
from app.clients.yahoo_finance import YahooFinanceClient


def test_yahoo_finance_client_builds_clearbit_logo_when_missing(monkeypatch):
    import yfinance as yf

    class DummyTicker:
        @property
        def info(self):
            return {"website": "https://www.microsoft.com"}

        def history(self, *args, **kwargs):
            return pd.DataFrame({"Close": [100.0, 110.0]})

    monkeypatch.setattr(yf, "Ticker", lambda _ticker: DummyTicker())

    c = YahooFinanceClient()
    q = c.fetch_quote("msft")

    assert q is not None
    assert q.symbol == "MSFT"
    assert q.current_price == 110.0
    assert q.daily_change_percent == 10.0
    assert q.logo_url == "https://logo.clearbit.com/www.microsoft.com"


def test_yahoo_finance_client_returns_none_when_not_enough_history(monkeypatch):
    import yfinance as yf

    class DummyTicker:
        @property
        def info(self):
            return {}

        def history(self, *args, **kwargs):
            return pd.DataFrame({"Close": [100.0]})

    monkeypatch.setattr(yf, "Ticker", lambda _ticker: DummyTicker())

    c = YahooFinanceClient()
    assert c.fetch_quote("AAPL") is None
