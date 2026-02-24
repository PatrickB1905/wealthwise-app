from __future__ import annotations

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


def fetch_quotes(
    symbols_csv: str, *, client: YahooFinanceClient, max_symbols: int
) -> list[QuoteData]:
    symbols = parse_symbols(symbols_csv, max_symbols=max_symbols)
    out: list[QuoteData] = []
    for sym in symbols:
        q = client.fetch_quote(sym)
        if q is not None:
            out.append(q)
    return out
