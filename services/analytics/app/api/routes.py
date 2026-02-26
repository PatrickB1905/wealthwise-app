from __future__ import annotations

import logging

import httpx
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


def get_http_client(request: Request) -> httpx.Client:
    client = getattr(request.app.state, "http_client", None)
    if client is None:
        client = httpx.Client(headers={"User-Agent": "wealthwise-analytics/1.0"})
        request.app.state.http_client = client
    return client


def get_positions_repo(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> PositionsRepository:
    http = get_http_client(request)
    return PositionsRepository(settings.positions_url, http=http, timeout_seconds=5.0)


def get_market_data_client(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> MarketDataClient:
    http = get_http_client(request)
    return MarketDataClient(settings.market_data_url, http=http, timeout_seconds=5.0, retries=2)


def get_yahoo_client() -> YahooFinanceClient:
    return YahooFinanceClient()


def require_auth_header(request: Request) -> str:
    auth = request.headers.get("authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    return auth


@router.get("/api/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    """
    Liveness probe: confirms the app is running.

    Intentionally does NOT call dependencies so unit tests do not require other services.
    """
    return {"status": "OK", "origin": settings.frontend_origin}


@router.get("/api/ready")
def ready(
    settings: Settings = Depends(get_settings),
    http: httpx.Client = Depends(get_http_client),
) -> dict[str, str]:
    """
    Readiness probe: confirms critical downstream dependencies are reachable.
    Safe to override in unit tests via app.dependency_overrides[get_http_client].
    """
    try:
        resp = http.get(f"{settings.positions_url.rstrip('/')}/health", timeout=2.0)
        resp.raise_for_status()
    except Exception as exc:
        log.warning("Readiness check failed (positions): %s", exc)
        raise HTTPException(status_code=503, detail="Positions service unavailable") from exc

    return {"status": "READY"}


@router.get("/api/analytics/summary", response_model=Summary)
def get_summary(
    userId: int | None = Query(
        None,
        description="Deprecated: user is derived from token; kept for backwards compatibility",
    ),
    auth: str = Depends(require_auth_header),
    repo: PositionsRepository = Depends(get_positions_repo),
    md: MarketDataClient = Depends(get_market_data_client),
) -> Summary:
    try:
        rows = repo.list_for_current_user(auth)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            raise HTTPException(
                status_code=exc.response.status_code, detail="Unauthorized"
            ) from exc
        log.exception("Positions query failed for summary")
        raise HTTPException(status_code=503, detail="Positions unavailable") from exc
    except Exception as exc:
        log.exception("Positions query failed for summary")
        raise HTTPException(status_code=503, detail="Positions unavailable") from exc

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
    userId: int | None = Query(
        None,
        description="Deprecated: user is derived from token; kept for backwards compatibility",
    ),
    months: int = Query(12, ge=1, description="Months back to include"),
    auth: str = Depends(require_auth_header),
    repo: PositionsRepository = Depends(get_positions_repo),
    yf_client: YahooFinanceClient = Depends(get_yahoo_client),
) -> list[HistoryItem]:
    try:
        rows = repo.list_for_current_user(auth)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            raise HTTPException(
                status_code=exc.response.status_code, detail="Unauthorized"
            ) from exc
        log.exception("Positions query failed for history")
        raise HTTPException(status_code=503, detail="Positions unavailable") from exc
    except Exception as exc:
        log.exception("Positions query failed for history")
        raise HTTPException(status_code=503, detail="Positions unavailable") from exc

    points = compute_history(rows, months, yf_client)
    return [HistoryItem(date=p.date, value=p.value) for p in points]
