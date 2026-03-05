from __future__ import annotations

import logging
from typing import TypedDict

import yfinance as yf

log = logging.getLogger(__name__)


class Quote(TypedDict):
    symbol: str
    currentPrice: float
    dailyChangePercent: float


def _uniq(xs: list[str]) -> list[str]:
    return list(dict.fromkeys(xs))


def fetch_quotes(symbols: list[str]) -> list[Quote]:
    """
    Returns: [{symbol, currentPrice, dailyChangePercent}]
    Uses yfinance download for 2d close -> compute daily pct.
    """
    syms = [s.strip().upper() for s in symbols if s.strip()]
    syms = _uniq(syms)
    if not syms:
        return []

    try:
        df = yf.download(
            tickers=" ".join(syms),
            period="2d",
            interval="1d",
            group_by="ticker",
            auto_adjust=False,
            progress=False,
            threads=True,
        )
    except Exception as exc:
        log.warning("yfinance download failed: %s", exc)
        return []

    out: list[Quote] = []

    if len(syms) == 1:
        closes = df["Close"].dropna().tolist()
        if len(closes) >= 2:
            prev_close = float(closes[-2])
            cur_close = float(closes[-1])
            pct = ((cur_close - prev_close) / prev_close) * 100 if prev_close else 0.0
            out.append(
                {
                    "symbol": syms[0],
                    "currentPrice": cur_close,
                    "dailyChangePercent": pct,
                }
            )
        return out

    for sym in syms:
        try:
            closes = df[sym]["Close"].dropna().tolist()
            if len(closes) < 2:
                continue
            prev_close = float(closes[-2])
            cur_close = float(closes[-1])
            pct = ((cur_close - prev_close) / prev_close) * 100 if prev_close else 0.0
            out.append(
                {
                    "symbol": sym,
                    "currentPrice": cur_close,
                    "dailyChangePercent": pct,
                }
            )
        except Exception:
            continue

    return out
