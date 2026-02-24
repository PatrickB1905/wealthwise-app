from __future__ import annotations

import logging
from dataclasses import dataclass
from urllib.parse import urlparse

import yfinance as yf

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class QuoteData:
    symbol: str
    current_price: float
    daily_change_percent: float
    logo_url: str


class YahooFinanceClient:
    """
    Small wrapper so we can unit test without real network calls.
    """

    def fetch_quote(self, symbol: str) -> QuoteData | None:
        sym = symbol.strip().upper()
        if not sym:
            return None

        try:
            tk = yf.Ticker(sym)

            info = tk.info or {}
            logo_url = str(info.get("logo_url") or "")

            website = str(info.get("website") or info.get("websiteUrl") or "")
            if not logo_url and website:
                domain = urlparse(website).netloc
                if domain:
                    logo_url = f"https://logo.clearbit.com/{domain}"

            hist = tk.history(period="2d", actions=False)
            if hist is None or len(hist) < 2:
                log.warning("Not enough history data for %s", sym)
                return None

            prev_close = float(hist["Close"].iloc[-2])
            current_price = float(hist["Close"].iloc[-1])

            daily_pct = ((current_price - prev_close) / prev_close) * 100.0 if prev_close else 0.0

            return QuoteData(
                symbol=sym,
                current_price=current_price,
                daily_change_percent=round(daily_pct, 2),
                logo_url=logo_url,
            )
        except Exception:
            log.exception("Failed to fetch quote for %s", sym)
            return None
