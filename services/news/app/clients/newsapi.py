from __future__ import annotations

import logging
from collections.abc import Mapping
from dataclasses import dataclass

import httpx

from app.core.config import Settings

log = logging.getLogger(__name__)

NEWSAPI_EVERYTHING_URL = "https://newsapi.org/v2/everything"


@dataclass(frozen=True)
class NewsApiArticle:
    title: str
    source: str
    url: str
    published_at: str


class NewsApiClient:
    def __init__(self, api_key: str, http: httpx.Client, timeout_seconds: float) -> None:
        self._api_key = api_key
        self._http = http
        self._timeout = timeout_seconds

    def close(self) -> None:
        self._http.close()

    def fetch_recent(self, query: str, limit: int) -> list[NewsApiArticle]:
        params: Mapping[str, str | int] = {
            "q": query,
            "apiKey": self._api_key,
            "pageSize": int(limit),
            "sortBy": "relevancy",
            "language": "en",
            "searchIn": "title,description",
        }

        resp = self._http.get(NEWSAPI_EVERYTHING_URL, params=params, timeout=self._timeout)
        if resp.status_code != 200:
            log.warning(
                "NewsAPI non-200 for query=%s: %s %s", query, resp.status_code, resp.text[:200]
            )
            raise RuntimeError(f"NewsAPI error ({resp.status_code})")

        data = resp.json()
        items = data.get("articles", []) or []

        out: list[NewsApiArticle] = []
        for it in items:
            out.append(
                NewsApiArticle(
                    title=str(it.get("title") or ""),
                    source=str((it.get("source") or {}).get("name") or ""),
                    url=str(it.get("url") or ""),
                    published_at=str(it.get("publishedAt") or ""),
                )
            )
        return out


def build_newsapi_client(settings: Settings) -> NewsApiClient:
    http = httpx.Client(headers={"User-Agent": "wealthwise-news/1.0"})
    return NewsApiClient(
        api_key=settings.news_api_key,
        http=http,
        timeout_seconds=settings.request_timeout_seconds,
    )
