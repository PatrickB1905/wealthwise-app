from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta

import pandas as pd

from app.clients.market_data import MarketDataClient
from app.clients.yahoo_finance import YahooFinanceClient
from app.repositories.positions import PositionRow
from app.services.summary import SummaryResult, compute_summary


@dataclass(frozen=True)
class Holding:
    ticker: str
    quantity: float
    avg_cost: float
    current_price: float | None
    market_value: float | None
    unrealized_pl: float | None
    unrealized_pl_percent: float | None
    weight: float | None


@dataclass(frozen=True)
class Concentration:
    top5_weight_percent: float
    hhi: float


def _group_open_positions(rows: list[PositionRow]) -> dict[str, list[PositionRow]]:
    grouped: dict[str, list[PositionRow]] = {}
    for r in rows:
        if r.sell_date is not None:
            continue
        if not r.ticker:
            continue
        grouped.setdefault(r.ticker, []).append(r)
    return grouped


def compute_holdings(rows: list[PositionRow], quotes: dict[str, float]) -> list[Holding]:
    grouped = _group_open_positions(rows)
    holdings: list[Holding] = []

    tmp: list[tuple[str, float, float]] = []
    for ticker, lots in grouped.items():
        qty = sum(x.quantity for x in lots)
        if qty <= 0:
            continue
        invested = sum(x.quantity * x.buy_price for x in lots)
        avg_cost = invested / qty
        tmp.append((ticker, qty, avg_cost))

    market_values: dict[str, float] = {}
    for ticker, qty, _avg_cost in tmp:
        if ticker in quotes:
            market_values[ticker] = float(quotes[ticker]) * qty

    total_mv = sum(market_values.values()) if market_values else 0.0

    for ticker, qty, avg_cost in tmp:
        cp = float(quotes[ticker]) if ticker in quotes else None
        mv = market_values.get(ticker)
        upl = (mv - (avg_cost * qty)) if (mv is not None and cp is not None) else None
        upl_pct = (upl / (avg_cost * qty) * 100.0) if (upl is not None and avg_cost * qty) else None
        weight = (mv / total_mv * 100.0) if (mv is not None and total_mv > 0) else None

        holdings.append(
            Holding(
                ticker=ticker,
                quantity=round(qty, 6),
                avg_cost=round(avg_cost, 6),
                current_price=round(cp, 6) if cp is not None else None,
                market_value=round(mv, 2) if mv is not None else None,
                unrealized_pl=round(upl, 2) if upl is not None else None,
                unrealized_pl_percent=round(upl_pct, 2) if upl_pct is not None else None,
                weight=round(weight, 2) if weight is not None else None,
            )
        )

    holdings.sort(key=lambda h: (h.market_value or 0.0), reverse=True)
    return holdings


def compute_concentration(holdings: list[Holding]) -> Concentration:
    weights = [h.weight for h in holdings if h.weight is not None]
    if not weights:
        return Concentration(top5_weight_percent=0.0, hhi=0.0)

    weights_sorted = sorted(weights, reverse=True)
    top5 = sum(weights_sorted[:5])
    hhi = sum(((w / 100.0) ** 2) for w in weights if w is not None)

    return Concentration(
        top5_weight_percent=round(top5, 2),
        hhi=round(hhi, 4),
    )


def _date_range_days(days: int) -> tuple[date, date, list[pd.Timestamp]]:
    end = pd.Timestamp.now().normalize()
    start = (end - pd.Timedelta(days=days)).date()
    end_date = end.date()
    idx = pd.date_range(start=start, end=end_date, freq="D")
    return start, end_date, list(idx)


def compute_portfolio_value_series(
    rows: list[PositionRow],
    days: int,
    yf: YahooFinanceClient,
    benchmark: str | None = None,
) -> tuple[pd.Series, pd.Series | None]:

    if days <= 0:
        raise ValueError("days must be positive")

    start, end, idx = _date_range_days(days)

    tickers = {r.ticker for r in rows if r.ticker}
    prices: dict[str, pd.Series] = {}
    for t in tickers:
        s = yf.fetch_daily_close(t, start=start, end=end + timedelta(days=1))
        prices[t] = s

    bench_series: pd.Series | None = None
    if benchmark:
        bench_series = yf.fetch_daily_close(benchmark, start=start, end=end + timedelta(days=1))

    values: list[float] = []
    for ts in idx:
        d = ts.to_pydatetime().date()
        total_value = 0.0

        for r in rows:
            if not r.ticker:
                continue

            buy_date = r.buy_date.date() if isinstance(r.buy_date, datetime) else None
            sell_date = r.sell_date.date() if isinstance(r.sell_date, datetime) else None

            if buy_date is not None and d < buy_date:
                continue

            if sell_date is not None and d >= sell_date:
                sp = float(r.sell_price or 0.0)
                total_value += sp * r.quantity
                continue

            series = prices.get(r.ticker)
            if series is None or series.empty:
                continue

            valid_idx = series.index[series.index <= pd.Timestamp(d)]
            if len(valid_idx) == 0:
                continue
            px = float(series.loc[valid_idx[-1]])
            total_value += px * r.quantity

        values.append(round(total_value, 6))

    portfolio = pd.Series(values, index=pd.to_datetime(idx).normalize(), dtype=float)
    if bench_series is not None and not bench_series.empty:
        bench_series = bench_series.sort_index()
        bench_series.index = pd.to_datetime(bench_series.index).normalize()
    return portfolio, bench_series


def _daily_returns(series: pd.Series) -> pd.Series:
    if series.empty:
        return pd.Series(dtype=float)
    rets = series.pct_change().dropna()
    return rets.replace([pd.NA, pd.NaT], 0.0)


def _max_drawdown_percent(series: pd.Series) -> float:
    if series.empty:
        return 0.0
    roll_max = series.cummax()
    dd = (series / roll_max) - 1.0
    return float(dd.min() * 100.0)


def compute_risk_metrics(
    portfolio_value: pd.Series,
    benchmark_close: pd.Series | None,
) -> tuple[float, float, float, float, float]:
    rets = _daily_returns(portfolio_value)
    if rets.empty:
        return 0.0, 0.0, 0.0, 0.0, 0.0

    vol_daily = float(rets.std(ddof=0))
    vol_annual = vol_daily * (252.0**0.5)

    max_dd_pct = _max_drawdown_percent(portfolio_value)

    mean_daily = float(rets.mean())
    sharpe_annual = (mean_daily / vol_daily * (252.0**0.5)) if vol_daily > 0 else 0.0

    beta = 0.0
    corr = 0.0

    if benchmark_close is not None and not benchmark_close.empty:
        b = benchmark_close.reindex(portfolio_value.index).ffill().dropna()
        p = portfolio_value.reindex(b.index).dropna()

        pr = _daily_returns(p)
        br = _daily_returns(b)

        joined = pd.concat([pr, br], axis=1).dropna()
        if joined.shape[0] > 5:
            pr2 = joined.iloc[:, 0]
            br2 = joined.iloc[:, 1]
            var_b = float(br2.var(ddof=0))
            cov_pb = float(pr2.cov(br2))
            beta = (cov_pb / var_b) if var_b > 0 else 0.0
            corr = float(pr2.corr(br2)) if pr2.std(ddof=0) > 0 and br2.std(ddof=0) > 0 else 0.0

    return float(vol_annual), float(max_dd_pct), float(sharpe_annual), float(beta), float(corr)


def build_overview(
    rows: list[PositionRow],
    md: MarketDataClient,
) -> tuple[SummaryResult, list[Holding], Concentration]:
    symbols = {r.ticker for r in rows if r.sell_date is None and r.ticker}
    try:
        quotes = md.fetch_quotes(symbols) if symbols else {}
    except RuntimeError:
        quotes = {}

    summary = compute_summary(rows, quotes)
    holdings = compute_holdings(rows, quotes)
    concentration = compute_concentration(holdings)
    return summary, holdings, concentration
