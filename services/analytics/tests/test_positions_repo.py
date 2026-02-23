from datetime import datetime

from app.repositories.positions import PositionsRepository


class DummyConn:
    def execute(self, _sql, _params):
        class Result:
            def mappings(self):
                return self

            def all(self):
                return [
                    {
                        "quantity": 2,
                        "buy_price": 10.0,
                        "sell_price": 15.0,
                        "sell_date": datetime(2025, 1, 10),
                        "ticker": "AAPL",
                        "buy_date": datetime(2025, 1, 1),
                    }
                ]

        return Result()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class DummyEngine:
    def connect(self):
        return DummyConn()


def test_positions_repo_maps_rows_correctly():
    repo = PositionsRepository(DummyEngine())
    rows = repo.list_by_user(1)
    assert len(rows) == 1
    r = rows[0]
    assert r.quantity == 2.0
    assert r.buy_price == 10.0
    assert r.sell_price == 15.0
    assert r.ticker == "AAPL"
