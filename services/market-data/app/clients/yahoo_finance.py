from __future__ import annotations

import logging
from dataclasses import dataclass
from urllib.parse import quote, urlparse

import yfinance as yf

from app.core.config import settings

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class QuoteData:
    symbol: str
    current_price: float
    daily_change_percent: float
    logo_url: str


def _normalize_domain_from_website(website: str) -> str:
    parsed = urlparse(website.strip())
    domain = parsed.netloc.strip().lower()

    if domain.startswith("www."):
        domain = domain[4:]

    return domain


def _build_logo_dev_url(domain: str) -> str:
    if not domain or not settings.logo_dev_token:
        return ""

    encoded_domain = quote(domain, safe="")
    encoded_token = quote(settings.logo_dev_token, safe="")
    base_url = settings.logo_dev_base_url.rstrip("/")

    return f"{base_url}/{encoded_domain}?token={encoded_token}"


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

            website = str(info.get("website") or info.get("websiteUrl") or "").strip()
            yahoo_logo_url = str(info.get("logo_url") or "").strip()

            logo_url = ""
            if website:
                domain = _normalize_domain_from_website(website)
                logo_url = _build_logo_dev_url(domain)

            if not logo_url and yahoo_logo_url:
                logo_url = yahoo_logo_url

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
