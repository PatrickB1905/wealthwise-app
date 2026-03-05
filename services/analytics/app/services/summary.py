from __future__ import annotations

import math
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


def _clean_float(value: float) -> float:
    return value if math.isfinite(value) else 0.0


def compute_summary(rows: list[PositionRow], quotes: dict[str, float]) -> SummaryResult:
    invested_raw = sum(r.quantity * r.buy_price for r in rows)

    closed = [r for r in rows if r.sell_date is not None]
    open_ = [r for r in rows if r.sell_date is None]

    closed_pl_raw = sum(((r.sell_price or 0.0) - r.buy_price) * r.quantity for r in closed)

    open_pl_raw = 0.0
    for r in open_:
        if r.ticker not in quotes:
            continue
        current = quotes[r.ticker]
        open_pl_raw += (current - r.buy_price) * r.quantity

    total_pl_raw = closed_pl_raw + open_pl_raw
    total_pl_percent_raw = (total_pl_raw / invested_raw * 100.0) if invested_raw else 0.0

    invested = round(_clean_float(float(invested_raw)), 2)
    total_pl = round(_clean_float(float(total_pl_raw)), 2)
    total_pl_percent = round(_clean_float(float(total_pl_percent_raw)), 2)

    return SummaryResult(
        invested=invested,
        total_pl=total_pl,
        total_pl_percent=total_pl_percent,
        open_count=len(open_),
        closed_count=len(closed),
    )


def build_quotes_for_open_positions(
    client: MarketDataClient, rows: list[PositionRow]
) -> dict[str, float]:
    symbols = {r.ticker for r in rows if r.sell_date is None}
    return client.fetch_quotes(symbols) if symbols else {}
