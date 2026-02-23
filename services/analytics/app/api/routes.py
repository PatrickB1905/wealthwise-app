from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from starlette.requests import Request

from app.api.schemas import HistoryItem, Summary
from app.clients.market_data import MarketDataClient
from app.clients.yahoo_finance import YahooFinanceClient
from app.core.config import Settings
from app.repositories.positions import PositionsRepository
from app.services.history import compute_history
from app.services.summary import build_quotes_for_open_positions, compute_summary

log = logging.getLogger(__name__)
router = APIRouter()


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_positions_repo(request: Request) -> PositionsRepository:
    engine = request.app.state.db_engine
    return PositionsRepository(engine)


def get_market_data_client(settings: Settings = Depends(get_settings)) -> MarketDataClient:
    return MarketDataClient(settings.market_data_url, timeout_seconds=5.0)


def get_yahoo_client() -> YahooFinanceClient:
    return YahooFinanceClient()


@router.get("/api/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"status": "OK", "origin": settings.frontend_origin}


@router.get("/api/analytics/summary", response_model=Summary)
def get_summary(
    userId: int = Query(..., description="User ID"),
    repo: PositionsRepository = Depends(get_positions_repo),
    md: MarketDataClient = Depends(get_market_data_client),
) -> Summary:
    try:
        rows = repo.list_by_user(userId)
    except Exception as exc:
        log.exception("Database query failed for summary")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc

    try:
        quotes = build_quotes_for_open_positions(md, rows)
    except RuntimeError:
        quotes = {}

    res = compute_summary(rows, quotes)

    return Summary(
        invested=res.invested,
        totalPL=res.total_pl,
        totalPLPercent=res.total_pl_percent,
        openCount=res.open_count,
        closedCount=res.closed_count,
    )


@router.get("/api/analytics/history", response_model=list[HistoryItem])
def get_history(
    userId: int = Query(..., description="User ID"),
    months: int = Query(12, ge=1, description="Months back to include"),
    repo: PositionsRepository = Depends(get_positions_repo),
    yf_client: YahooFinanceClient = Depends(get_yahoo_client),
) -> list[HistoryItem]:
    try:
        rows = repo.list_by_user(userId)
    except Exception as exc:
        log.exception("Database query failed for history")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc

    points = compute_history(rows, months, yf_client)
    return [HistoryItem(date=p.date, value=p.value) for p in points]
