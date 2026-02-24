from app.api import routes
from app.core.config import Settings
from app.main import create_app
from app.services.quotes import parse_symbols
from fastapi.testclient import TestClient


class FakeYF:
    def fetch_quote(self, symbol: str):
        class Q:
            def __init__(self, s: str):
                self.symbol = s
                self.current_price = 123.0
                self.daily_change_percent = 1.23
                self.logo_url = "https://logo.clearbit.com/example.com"

        return Q(symbol)


def test_quotes_returns_list():
    app = create_app(Settings(market_data_max_symbols=50))  # type: ignore[arg-type]
    app.dependency_overrides[routes.get_yahoo_client] = lambda: FakeYF()

    with TestClient(app) as client:
        resp = client.get("/api/quotes", params={"symbols": "AAPL,MSFT"})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert {d["symbol"] for d in data} == {"AAPL", "MSFT"}


def test_parse_symbols_dedupes_uppercases_and_trims():
    out = parse_symbols(" aapl ,MSFT, aapl,,  ", max_symbols=50)
    assert out == ["AAPL", "MSFT"]


def test_parse_symbols_respects_max_symbols():
    out = parse_symbols("AAPL,MSFT,GOOG,TSLA", max_symbols=2)
    assert out == ["AAPL", "MSFT"]
