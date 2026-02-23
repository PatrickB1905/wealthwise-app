from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from app.clients.yahoo_finance import YahooFinanceClient
from app.repositories.positions import PositionRow


@dataclass(frozen=True)
class HistoryPoint:
    date: str
    value: float


def compute_history(rows: list[PositionRow], months: int, yf_client: YahooFinanceClient) -> list[HistoryPoint]:
    if not rows:
        return []

    tickers = {r.ticker for r in rows}
    if not tickers:
        return []

    now = pd.Timestamp.now().normalize()
    month_ends = pd.date_range(end=now, periods=months, freq="ME").to_pydatetime().tolist()

    hist_data: dict[str, pd.Series] = {}
    for sym in tickers:
        hist_data[sym] = yf_client.fetch_monthly_close(sym, months + 1)

    points: list[HistoryPoint] = []

    for dt in month_ends:
        total_profit = 0.0

        for r in rows:
            if r.buy_date is not None and r.buy_date > dt:
                continue

            if r.sell_date is not None and r.sell_date <= dt:
                sp = r.sell_price or 0.0
                total_profit += (sp - r.buy_price) * r.quantity
                continue

            series = hist_data.get(r.ticker, pd.Series(dtype=float))
            idx = series.index[series.index <= dt]
            price = float(series.loc[idx[-1]]) if len(idx) > 0 else 0.0
            total_profit += (price - r.buy_price) * r.quantity

        points.append(HistoryPoint(date=dt.strftime("%Y-%m-%d"), value=round(total_profit, 2)))

    return points
