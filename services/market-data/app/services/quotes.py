from __future__ import annotations

import time
from dataclasses import dataclass

import yfinance as yf

from app.clients.yahoo_finance import QuoteData, YahooFinanceClient


def parse_symbols(symbols_csv: str, *, max_symbols: int) -> list[str]:
    raw = [s.strip().upper() for s in symbols_csv.split(",")]
    uniq: list[str] = []
    seen: set[str] = set()

    for s in raw:
        if not s:
            continue
        if s in seen:
            continue
        seen.add(s)
        uniq.append(s)
        if len(uniq) >= max_symbols:
            break

    return uniq


@dataclass
class _QuoteRow:
    symbol: str
    current_price: float
    daily_change_percent: float


_CACHE: dict[str, QuoteData] = {}
_CACHE_TS: dict[str, float] = {}
_CACHE_TTL_SECONDS = 30.0


def _cache_put(q: QuoteData, *, now: float) -> None:
    _CACHE[q.symbol] = q
    _CACHE_TS[q.symbol] = now


def _cache_get(sym: str, *, now: float) -> QuoteData | None:
    q = _CACHE.get(sym)
    if q is None:
        return None

    ts = _CACHE_TS.get(sym, 0.0)
    age = now - ts
    if age > _CACHE_TTL_SECONDS:
        _CACHE.pop(sym, None)
        _CACHE_TS.pop(sym, None)
        return None

    return q


def _compute_from_download(symbols: list[str]) -> dict[str, _QuoteRow]:
    if not symbols:
        return {}

    df = yf.download(
        tickers=" ".join(symbols),
        period="2d",
        interval="1d",
        group_by="ticker",
        auto_adjust=False,
        progress=False,
        threads=True,
    )

    out: dict[str, _QuoteRow] = {}

    if len(symbols) == 1:
        sym = symbols[0]
        try:
            closes = df["Close"].dropna().tolist()
            if len(closes) < 2:
                return {}
            prev_close = float(closes[-2])
            cur_close = float(closes[-1])
            pct = ((cur_close - prev_close) / prev_close) * 100.0 if prev_close else 0.0
            out[sym] = _QuoteRow(
                symbol=sym,
                current_price=cur_close,
                daily_change_percent=round(pct, 2),
            )
        except Exception:
            return {}
        return out

    for sym in symbols:
        try:
            closes = df[sym]["Close"].dropna().tolist()
            if len(closes) < 2:
                continue
            prev_close = float(closes[-2])
            cur_close = float(closes[-1])
            pct = ((cur_close - prev_close) / prev_close) * 100.0 if prev_close else 0.0
            out[sym] = _QuoteRow(
                symbol=sym,
                current_price=cur_close,
                daily_change_percent=round(pct, 2),
            )
        except Exception:
            continue

    return out


def fetch_quotes(
    symbols_csv: str,
    *,
    client: YahooFinanceClient,
    max_symbols: int,
) -> list[QuoteData]:
    symbols = parse_symbols(symbols_csv, max_symbols=max_symbols)
    if not symbols:
        return []

    now = time.time()
    price_rows = _compute_from_download(symbols)

    out: list[QuoteData] = []
    for sym in symbols:
        row = price_rows.get(sym)

        if row is None:
            cached = _cache_get(sym, now=now)
            if cached is not None:
                out.append(cached)
            continue

        logo_url = ""
        try:
            q = client.fetch_quote(sym)
            if q is not None:
                logo_url = q.logo_url
        except Exception:
            cached = _cache_get(sym, now=now)
            if cached is not None and cached.logo_url:
                logo_url = cached.logo_url

        quote = QuoteData(
            symbol=sym,
            current_price=row.current_price,
            daily_change_percent=row.daily_change_percent,
            logo_url=logo_url,
        )

        _cache_put(quote, now=now)
        out.append(quote)

    return out
