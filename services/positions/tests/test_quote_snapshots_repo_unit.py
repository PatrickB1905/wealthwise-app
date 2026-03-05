from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.quote_snapshots import QuoteSnapshotsRepository


@pytest.mark.asyncio
async def test_upsert_and_get_many(async_session: AsyncSession) -> None:
    repo = QuoteSnapshotsRepository(session=async_session)

    await repo.upsert_many(
        [
            {"symbol": "AAPL", "currentPrice": 100.0, "dailyChangePercent": 1.5, "logoUrl": "x"},
            {"symbol": "MSFT", "currentPrice": 200.0, "dailyChangePercent": -0.5, "logoUrl": ""},
        ]
    )
    await async_session.commit()

    got = await repo.get_many(["aapl", "msft", "goog"])
    assert "AAPL" in got
    assert "MSFT" in got
    assert "GOOG" not in got

    assert got["AAPL"].currentPrice == 100.0
    assert got["AAPL"].logoUrl == "x"

    # Update AAPL; logoUrl omitted -> should keep existing "x"
    await repo.upsert_many([{"symbol": "AAPL", "currentPrice": 101.0, "dailyChangePercent": 2.0}])
    await async_session.commit()

    got2 = await repo.get_many(["AAPL"])
    assert got2["AAPL"].currentPrice == 101.0
    assert got2["AAPL"].logoUrl == "x"


@pytest.mark.asyncio
async def test_upsert_ignores_invalid_rows_and_empty_inputs(async_session: AsyncSession) -> None:
    repo = QuoteSnapshotsRepository(session=async_session)

    # Empty inputs should be no-ops
    await repo.upsert_many([])
    got = await repo.get_many([])
    assert got == {}

    # Invalid rows should be ignored
    await repo.upsert_many(
        [
            {"symbol": "", "currentPrice": 1.0, "dailyChangePercent": 0.0},
            {"symbol": "AAPL", "currentPrice": "nope", "dailyChangePercent": 0.0},
            {"symbol": "AAPL", "currentPrice": 1.0, "dailyChangePercent": None},
            "not-a-dict",  # type: ignore[arg-type]
            {"symbol": "MSFT", "currentPrice": 2.0, "dailyChangePercent": 0.0, "logoUrl": "m"},
        ]
    )
    await async_session.commit()

    got2 = await repo.get_many(["msft", "aapl"])
    assert "MSFT" in got2
    assert "AAPL" not in got2
    assert got2["MSFT"].currentPrice == 2.0
    assert got2["MSFT"].logoUrl == "m"
