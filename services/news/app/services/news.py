from __future__ import annotations

from app.clients.newsapi import NewsApiArticle, NewsApiClient


def parse_symbols(symbols_csv: str, max_symbols: int = 25) -> list[str]:
    symbols = sorted({s.strip().upper() for s in symbols_csv.split(",") if s.strip()})
    return symbols[:max_symbols]


def fetch_articles_for_symbols(
    client: NewsApiClient,
    symbols: list[str],
    per_symbol_limit: int,
) -> list[NewsApiArticle]:
    all_articles: list[NewsApiArticle] = []
    for sym in symbols:
        all_articles.extend(client.fetch_recent(sym, per_symbol_limit))
    return all_articles
