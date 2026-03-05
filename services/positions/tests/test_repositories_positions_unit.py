from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from app.repositories.positions import PositionsRepository, _normalize_status


@dataclass
class FakePosition:
    id: int
    userId: int
    ticker: str
    quantity: float
    buyPrice: float
    buyDate: datetime
    sellPrice: float | None = None
    sellDate: datetime | None = None


class _FakeScalars:
    def __init__(self, rows: list[Any]) -> None:
        self._rows = rows

    def all(self) -> list[Any]:
        return list(self._rows)


class _FakeResult:
    def __init__(self, *, scalars_rows: list[Any] | None = None, scalar_one: Any = None) -> None:
        self._scalars_rows = scalars_rows
        self._scalar_one = scalar_one

    def scalars(self) -> _FakeScalars:
        assert self._scalars_rows is not None
        return _FakeScalars(self._scalars_rows)

    def scalar_one_or_none(self) -> Any:
        return self._scalar_one

    def scalar_one(self) -> Any:
        assert self._scalar_one is not None
        return self._scalar_one

    def all(self) -> list[tuple[Any, Any]]:
        assert isinstance(self._scalar_one, list)
        return self._scalar_one


class FakeSession:
    def __init__(self) -> None:
        self.added: list[Any] = []
        self.executed: list[Any] = []
        self._queue: list[_FakeResult] = []

    def queue(self, *results: _FakeResult) -> None:
        self._queue.extend(results)

    def add(self, obj: Any) -> None:
        self.added.append(obj)

    async def execute(self, stmt: Any) -> _FakeResult:
        self.executed.append(stmt)
        assert self._queue, "FakeSession.execute called but no queued results remain"
        return self._queue.pop(0)

    async def commit(self) -> None:
        return

    async def refresh(self, obj: Any) -> None:
        if getattr(obj, "id", None) is None:
            obj.id = 1  # type: ignore[attr-defined]


def test_normalize_status():
    assert _normalize_status("") == "open"
    assert _normalize_status("  ") == "open"
    assert _normalize_status("OPEN") == "open"
    assert _normalize_status("Closed") == "closed"


def test_list_for_user_open_closed_and_invalid_status():
    session = FakeSession()
    repo = PositionsRepository(session=session)  # type: ignore[arg-type]

    open_row = FakePosition(
        id=1,
        userId=7,
        ticker="AAPL",
        quantity=1.0,
        buyPrice=10.0,
        buyDate=datetime.now(timezone.utc),
        sellDate=None,
    )
    closed_row = FakePosition(
        id=2,
        userId=7,
        ticker="MSFT",
        quantity=2.0,
        buyPrice=5.0,
        buyDate=datetime.now(timezone.utc),
        sellDate=datetime.now(timezone.utc),
        sellPrice=6.0,
    )

    session.queue(_FakeResult(scalars_rows=[open_row]))
    rows_open = asyncio.run(repo.list_for_user(user_id=7, status="open"))
    assert rows_open == [open_row]

    session.queue(_FakeResult(scalars_rows=[closed_row]))
    rows_closed = asyncio.run(repo.list_for_user(user_id=7, status="closed"))
    assert rows_closed == [closed_row]

    rows_invalid = asyncio.run(repo.list_for_user(user_id=7, status="weird"))
    assert rows_invalid == []


def test_create_close_update_delete_and_grouping():
    session = FakeSession()
    repo = PositionsRepository(session=session)  # type: ignore[arg-type]

    created = asyncio.run(
        repo.create(
            user_id=7,
            ticker="AAPL",
            quantity=1.0,
            buy_price=10.0,
            buy_date=None,
        )
    )
    assert session.added, "Expected repo.create() to add a Position()"
    assert created.ticker == "AAPL"

    existing = FakePosition(
        id=1,
        userId=7,
        ticker="AAPL",
        quantity=1.0,
        buyPrice=10.0,
        buyDate=datetime.now(timezone.utc),
        sellDate=None,
    )
    closed = FakePosition(
        id=1,
        userId=7,
        ticker="AAPL",
        quantity=1.0,
        buyPrice=10.0,
        buyDate=existing.buyDate,
        sellDate=datetime.now(timezone.utc),
        sellPrice=12.0,
    )
    session.queue(
        _FakeResult(scalar_one=existing),
        _FakeResult(scalar_one=None),
        _FakeResult(scalar_one=closed),
    )
    out = asyncio.run(repo.close(user_id=7, position_id=1, sell_price=12.0, sell_date=None))
    assert out == closed

    updated = FakePosition(
        id=1,
        userId=7,
        ticker="AAPL",
        quantity=3.0,
        buyPrice=11.0,
        buyDate=existing.buyDate,
        sellDate=closed.sellDate,
        sellPrice=closed.sellPrice,
    )
    session.queue(
        _FakeResult(scalar_one=existing),
        _FakeResult(scalar_one=None),
        _FakeResult(scalar_one=updated),
    )
    out2 = asyncio.run(
        repo.update(
            user_id=7,
            position_id=1,
            quantity=3.0,
            buy_price=11.0,
            buy_date=None,
            sell_price=None,
            sell_date=None,
        )
    )
    assert out2 == updated

    session.queue(_FakeResult(scalar_one=existing), _FakeResult(scalar_one=None))
    ok = asyncio.run(repo.delete(user_id=7, position_id=1))
    assert ok is True

    session.queue(_FakeResult(scalar_one=None))
    asyncio.run(repo.delete_many_for_user(user_id=7))

    session.queue(_FakeResult(scalar_one=[(7, "AAPL"), (7, "MSFT"), (2, "TSLA")]))
    grouped = asyncio.run(repo.list_open_tickers_grouped_by_user())
    assert grouped == {7: ["AAPL", "MSFT"], 2: ["TSLA"]}
