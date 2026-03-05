from __future__ import annotations

import pytest
from app.repositories.positions import PositionsRepository


class DummyHttp:
    def get(self, *args, **kwargs):
        raise AssertionError("HTTP should not be called in these tests")


def test_positions_repo_parse_row_maps_required_fields():
    repo = PositionsRepository("http://positions:4000/api", http=DummyHttp())

    item = {
        "quantity": 2,
        "buyPrice": 10.0,
        "sellPrice": 15.0,
        "sellDate": "2025-01-10T00:00:00Z",
        "ticker": "AAPL",
        "buyDate": "2025-01-01T00:00:00Z",
    }

    row = repo._parse_row(item)
    assert row.quantity == 2.0
    assert row.buy_price == 10.0
    assert row.sell_price == 15.0
    assert row.ticker == "AAPL"
    assert row.buy_date is not None
    assert row.sell_date is not None


def test_positions_repo_parse_row_handles_snake_case_fallbacks():
    repo = PositionsRepository("http://positions:4000/api", http=DummyHttp())

    item = {
        "quantity": 1,
        "buy_price": 100.0,
        "sell_price": None,
        "sell_date": None,
        "ticker": "MSFT",
        "buy_date": None,
    }

    row = repo._parse_row(item)
    assert row.buy_price == 100.0
    assert row.sell_price is None


def test_positions_repo_parse_dt_returns_none_for_invalid_types():
    repo = PositionsRepository("http://positions:4000/api", http=DummyHttp())
    assert repo._parse_dt(12345) is None


def test_positions_repo_fetch_positions_raises_on_non_list_payload():
    class HttpReturnsDict:
        def get(self, *_args, **_kwargs):
            class Resp:
                def raise_for_status(self):  # noqa: D401
                    return None

                def json(self):
                    return {"not": "a list"}

            return Resp()

    repo = PositionsRepository("http://positions:4000/api", http=HttpReturnsDict())
    with pytest.raises(RuntimeError, match="non-list payload"):
        repo._fetch_positions(auth_header="Bearer x", status="open")
