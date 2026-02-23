from __future__ import annotations

import logging

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
            return series
        except Exception as exc:
            log.exception("Error fetching history for %s", ticker)
            return pd.Series(dtype=float)
