from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Query
from starlette.requests import Request

from app.api.schemas import Quote
from app.clients.yahoo_finance import YahooFinanceClient
from app.core.config import Settings
from app.services.quotes import fetch_quotes

log = logging.getLogger(__name__)
router = APIRouter()


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_yahoo_client() -> YahooFinanceClient:
    return YahooFinanceClient()


@router.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "OK"}


@router.get("/api/quotes", response_model=list[Quote])
def quotes(
    symbols: str = Query(..., description="Comma-separated symbols, e.g. AAPL,MSFT"),
    settings: Settings = Depends(get_settings),
    client: YahooFinanceClient = Depends(get_yahoo_client),
) -> list[Quote]:
    data = fetch_quotes(symbols, client=client, max_symbols=settings.max_symbols)
    return [
        Quote(
            symbol=q.symbol,
            currentPrice=q.current_price,
            dailyChangePercent=q.daily_change_percent,
            logoUrl=q.logo_url,
        )
        for q in data
    ]
