from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone
from urllib.parse import urlparse

from app.clients.newsapi import NewsApiArticle, NewsApiClient

FINANCE_TERMS = {
    "stock",
    "stocks",
    "share",
    "shares",
    "market",
    "markets",
    "earnings",
    "revenue",
    "profit",
    "profits",
    "analyst",
    "analysts",
    "rating",
    "ratings",
    "price target",
    "forecast",
    "guidance",
    "valuation",
    "investor",
    "investors",
    "nasdaq",
    "nyse",
    "dividend",
    "business",
    "company",
    "companies",
}

GARBAGE_PATTERNS = [
    r"\b1080p\b",
    r"\b720p\b",
    r"\b2160p\b",
    r"\bweb[- ]?dl\b",
    r"\bwebrip\b",
    r"\bbluray\b",
    r"\bbrrip\b",
    r"\bh[ .-]?264\b",
    r"\bh[ .-]?265\b",
    r"\bx264\b",
    r"\bx265\b",
    r"\bac3\b",
    r"\byify\b",
    r"\betrg\b",
    r"\byts\b",
    r"\bproper\b",
    r"\bdual audio\b",
    r"\bmadsky\b",
]

GARBAGE_REGEXES = [re.compile(pat, re.IGNORECASE) for pat in GARBAGE_PATTERNS]
NON_ALPHA_NUMERIC_NOISE = re.compile(r"[^A-Za-z0-9\s:/&+().,\-]+")


@dataclass(frozen=True)
class RankedArticle:
    title: str
    source: str
    url: str
    published_at: str
    relevance_score: int


def parse_symbols(symbols_csv: str, max_symbols: int = 25) -> list[str]:
    symbols = sorted({s.strip().upper() for s in symbols_csv.split(",") if s.strip()})
    return symbols[:max_symbols]


def build_symbol_query(symbol: str) -> str:
    finance_clause = " OR ".join(
        [
            "stock",
            "shares",
            "earnings",
            "revenue",
            "analyst",
            "market",
            "business",
            "investor",
            "forecast",
            "guidance",
        ]
    )
    return f'("{symbol}") AND ({finance_clause})'


def fetch_articles_for_symbols(
    client: NewsApiClient,
    symbols: list[str],
    per_symbol_limit: int,
    minimum_score: int = 3,
) -> list[NewsApiArticle]:
    ranked: list[RankedArticle] = []

    for symbol in symbols:
        query = build_symbol_query(symbol)
        raw_articles = client.fetch_recent(query, per_symbol_limit)

        for article in raw_articles:
            if not is_valid_article_shape(article):
                continue
            if is_obviously_garbage(article.title):
                continue

            score = score_article(article, symbol)
            if score < minimum_score:
                continue

            ranked.append(
                RankedArticle(
                    title=clean_text(article.title),
                    source=clean_text(article.source),
                    url=article.url.strip(),
                    published_at=article.published_at.strip(),
                    relevance_score=score,
                )
            )

    deduped = dedupe_articles(ranked)
    deduped.sort(
        key=lambda a: (a.relevance_score, parse_published_at(a.published_at)), reverse=True
    )

    return [
        NewsApiArticle(
            title=a.title,
            source=a.source,
            url=a.url,
            published_at=a.published_at,
        )
        for a in deduped
    ]


def is_valid_article_shape(article: NewsApiArticle) -> bool:
    if not article.title.strip():
        return False
    if not article.url.strip():
        return False

    parsed = urlparse(article.url)
    if parsed.scheme not in {"http", "https"}:
        return False

    return True


def is_obviously_garbage(title: str) -> bool:
    normalized = clean_text(title).lower()

    for regex in GARBAGE_REGEXES:
        if regex.search(normalized):
            return True

    if normalized.count("-") >= 4 and any(ch.isdigit() for ch in normalized):
        return True

    if len(normalized.split()) <= 3:
        return True

    return False


def score_article(article: NewsApiArticle, symbol: str) -> int:
    title = clean_text(article.title).lower()
    source = clean_text(article.source).lower()

    score = 0

    if symbol.lower() in title:
        score += 3

    finance_hits = sum(1 for term in FINANCE_TERMS if term in title)
    score += min(finance_hits, 4)

    if source in TRUSTED_SOURCES:
        score += 2

    if is_recent(article.published_at):
        score += 1

    if any(regex.search(title) for regex in GARBAGE_REGEXES):
        score -= 10

    if looks_like_release_scene_title(title):
        score -= 10

    return score


TRUSTED_SOURCES = {
    "reuters",
    "bloomberg",
    "cnbc",
    "marketwatch",
    "yahoo finance",
    "benzinga",
    "the motley fool",
    "investing.com",
    "barron's",
    "fortune",
    "the wall street journal",
    "seeking alpha",
}


def looks_like_release_scene_title(title: str) -> bool:
    upperish_tokens = [t for t in re.split(r"\s+", title) if t]
    if not upperish_tokens:
        return False

    noisy_tokens = 0
    for token in upperish_tokens:
        if any(ch.isdigit() for ch in token):
            noisy_tokens += 1
        if token.isupper() and len(token) >= 4:
            noisy_tokens += 1

    return noisy_tokens >= 4


def dedupe_articles(articles: list[RankedArticle]) -> list[RankedArticle]:
    best_by_key: dict[str, RankedArticle] = {}

    for article in articles:
        key = canonical_dedupe_key(article)
        existing = best_by_key.get(key)
        if existing is None or article.relevance_score > existing.relevance_score:
            best_by_key[key] = article

    return list(best_by_key.values())


def canonical_dedupe_key(article: RankedArticle) -> str:
    parsed = urlparse(article.url.strip())
    path = parsed.path.rstrip("/")
    host = parsed.netloc.lower()
    title = re.sub(r"\s+", " ", article.title.strip().lower())
    return f"{host}{path}|{title}"


def parse_published_at(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return datetime(1970, 1, 1, tzinfo=timezone.utc)


def is_recent(published_at: str, recent_days: int = 7) -> bool:
    dt = parse_published_at(published_at)
    return (datetime.now(timezone.utc) - dt).days <= recent_days


def clean_text(value: str) -> str:
    cleaned = NON_ALPHA_NUMERIC_NOISE.sub(" ", value or "")
    return re.sub(r"\s+", " ", cleaned).strip()
