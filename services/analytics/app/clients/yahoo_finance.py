from __future__ import annotations

import logging
from datetime import date

import pandas as pd
import yfinance as yf

log = logging.getLogger(__name__)


class YahooFinanceClient:
    def fetch_monthly_close(self, ticker: str, months: int) -> pd.Series:
        """
        Returns a monthly Close series indexed by timestamp.
        months should include enough lookback to cover the requested chart range.
        """
        try:
            df = yf.Ticker(ticker).history(
                period=f"{months}mo",
                interval="1mo",
                actions=False,
            )
            series = df["Close"]
            if getattr(series.index, "tz", None) is not None:
                series.index = series.index.tz_convert(None)
            series.index = series.index.normalize()
            return series
        except Exception:
            log.exception("Error fetching monthly history for %s", ticker)
            return pd.Series(dtype=float)

    def fetch_daily_close(self, ticker: str, start: date, end: date) -> pd.Series:
        try:
            df = yf.Ticker(ticker).history(
                start=start.isoformat(),
                end=end.isoformat(),
                interval="1d",
                actions=False,
            )
            if df.empty:
                return pd.Series(dtype=float)

            series = df["Close"]
            if getattr(series.index, "tz", None) is not None:
                series.index = series.index.tz_convert(None)
            series.index = pd.to_datetime(series.index).normalize()
            return series
        except Exception:
            log.exception("Error fetching daily history for %s", ticker)
            return pd.Series(dtype=float)
