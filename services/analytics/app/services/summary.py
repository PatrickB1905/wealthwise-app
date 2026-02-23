from __future__ import annotations

from dataclasses import dataclass

from app.clients.market_data import MarketDataClient
from app.repositories.positions import PositionRow


@dataclass(frozen=True)
class SummaryResult:
    invested: float
    total_pl: float
    total_pl_percent: float
    open_count: int
    closed_count: int


def compute_summary(rows: list[PositionRow], quotes: dict[str, float]) -> SummaryResult:
    invested = sum(r.quantity * r.buy_price for r in rows)

    closed = [r for r in rows if r.sell_date is not None]
    open_ = [r for r in rows if r.sell_date is None]

    closed_pl = sum(
        ((r.sell_price or 0.0) - r.buy_price) * r.quantity
        for r in closed
    )

    open_pl = 0.0
    for r in open_:
        if r.ticker not in quotes:
            continue
        current = quotes[r.ticker]
        open_pl += (current - r.buy_price) * r.quantity

    total_pl = closed_pl + open_pl
    total_pl_percent = (total_pl / invested * 100.0) if invested else 0.0

    return SummaryResult(
        invested=round(invested, 2),
        total_pl=round(total_pl, 2),
        total_pl_percent=round(total_pl_percent, 2),
        open_count=len(open_),
        closed_count=len(closed),
    )


def build_quotes_for_open_positions(client: MarketDataClient, rows: list[PositionRow]) -> dict[str, float]:
    symbols = {r.ticker for r in rows if r.sell_date is None}
    return client.fetch_quotes(symbols) if symbols else {}
