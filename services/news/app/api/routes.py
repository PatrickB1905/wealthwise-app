from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from starlette.requests import Request

from app.api.schemas import Article
from app.clients.newsapi import NewsApiClient, build_newsapi_client
from app.core.config import Settings
from app.services.news import fetch_articles_for_symbols, parse_symbols

log = logging.getLogger(__name__)
router = APIRouter()


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_newsapi_client(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> NewsApiClient:
    client = getattr(request.app.state, "newsapi_client", None)
    if client is not None:
        return client

    client = build_newsapi_client(settings)
    request.app.state.newsapi_client = client
    return client


@router.get("/api/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"status": "OK", "origin": settings.frontend_origin}


@router.get("/api/news", response_model=list[Article])
def get_news(
    symbols: str = Query(..., description="Comma-separated symbols"),
    settings: Settings = Depends(get_settings),
    client: NewsApiClient = Depends(get_newsapi_client),
) -> list[Article]:
    syms = parse_symbols(symbols)
    if not syms:
        return []

    try:
        items = fetch_articles_for_symbols(
            client=client,
            symbols=syms,
            per_symbol_limit=settings.per_symbol_limit,
            minimum_score=settings.minimum_article_score,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail="Upstream news provider unavailable") from exc
    except Exception as exc:
        log.exception("Unexpected failure fetching news")
        raise HTTPException(status_code=500, detail="Internal server error") from exc

    return [
        Article(
            title=a.title,
            source=a.source,
            url=a.url,
            publishedAt=a.published_at,
        )
        for a in items
    ]
