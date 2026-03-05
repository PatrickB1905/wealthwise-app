from __future__ import annotations

from datetime import datetime

import pandas as pd
from app.repositories.positions import PositionRow
from app.services.history import compute_history


class YFEmpty:
    def fetch_monthly_close(self, _ticker: str, _months: int) -> pd.Series:
        return pd.Series(dtype=float)


def test_compute_history_returns_empty_when_no_rows():
    assert compute_history([], months=2, yf_client=YFEmpty()) == []


def test_compute_history_uses_zero_price_when_series_has_no_points_before_dt():
    rows = [
        PositionRow(
            quantity=1,
            buy_price=100.0,
            sell_price=None,
            sell_date=None,
            ticker="MSFT",
            buy_date=datetime(1990, 1, 1),
        )
    ]

    points = compute_history(rows, months=2, yf_client=YFEmpty())

    assert len(points) == 2
    assert all(p.value == -100.0 for p in points)
