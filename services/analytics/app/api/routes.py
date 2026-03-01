from __future__ import annotations

import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from starlette.requests import Request

from app.api.schemas import (
    Concentration,
    HistoryItem,
    HoldingItem,
    Overview,
    PerformancePoint,
    PerformanceResponse,
    RiskResponse,
    Summary,
)
from app.clients.market_data import MarketDataClient
from app.clients.yahoo_finance import YahooFinanceClient
from app.core.auth import get_current_user_id_from_request, require_bearer_auth_header
from app.core.config import Settings
from app.repositories.positions import PositionsRepository
from app.services.cache import CacheKey, TTLCache
from app.services.history import compute_history
from app.services.portfolio import (
    build_overview,
    compute_portfolio_value_series,
    compute_risk_metrics,
)
from app.services.summary import compute_summary

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


def get_cache(request: Request, settings: Settings = Depends(get_settings)) -> TTLCache:
    cache = getattr(request.app.state, "analytics_cache", None)
    if cache is None:
        cache = TTLCache(ttl_seconds=settings.analytics_cache_ttl_seconds)
        request.app.state.analytics_cache = cache
    return cache


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
    return require_bearer_auth_header(request)


@router.get("/api/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"status": "OK", "origin": settings.frontend_origin}


@router.get("/api/ready")
def ready(
    settings: Settings = Depends(get_settings),
    http: httpx.Client = Depends(get_http_client),
) -> dict[str, str]:
    try:
        resp = http.get(f"{settings.positions_url.rstrip('/')}/health", timeout=2.0)
        resp.raise_for_status()
    except Exception as exc:
        log.warning("Readiness check failed (positions): %s", exc)
        raise HTTPException(status_code=503, detail="Positions service unavailable") from exc

    return {"status": "READY"}


def _fetch_positions(repo: PositionsRepository, auth: str) -> list:
    try:
        return repo.list_for_current_user(auth)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            raise HTTPException(
                status_code=exc.response.status_code, detail="Unauthorized"
            ) from exc
        log.exception("Positions query failed")
        raise HTTPException(status_code=503, detail="Positions unavailable") from exc
    except Exception as exc:
        log.exception("Positions query failed")
        raise HTTPException(status_code=503, detail="Positions unavailable") from exc


@router.get("/api/analytics/summary", response_model=Summary)
def get_summary(
    userId: int | None = Query(None, description="Deprecated; user derived from token"),
    auth: str = Depends(require_auth_header),
    repo: PositionsRepository = Depends(get_positions_repo),
    md: MarketDataClient = Depends(get_market_data_client),
) -> Summary:
    rows = _fetch_positions(repo, auth)

    symbols = {r.ticker for r in rows if r.sell_date is None and r.ticker}
    try:
        quotes = md.fetch_quotes(symbols) if symbols else {}
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
    userId: int | None = Query(None, description="Deprecated; user derived from token"),
    months: int = Query(12, ge=1, description="Months back to include"),
    auth: str = Depends(require_auth_header),
    repo: PositionsRepository = Depends(get_positions_repo),
    yf_client: YahooFinanceClient = Depends(get_yahoo_client),
) -> list[HistoryItem]:
    rows = _fetch_positions(repo, auth)
    points = compute_history(rows, months, yf_client)
    return [HistoryItem(date=p.date, value=p.value) for p in points]


@router.get("/api/analytics/overview", response_model=Overview)
def get_overview(
    request: Request,
    userId: int | None = Query(None, description="Deprecated; user derived from token"),
    auth: str = Depends(require_auth_header),
    repo: PositionsRepository = Depends(get_positions_repo),
    md: MarketDataClient = Depends(get_market_data_client),
    cache: TTLCache = Depends(get_cache),
) -> Overview:
    uid = get_current_user_id_from_request(request)

    key = CacheKey(user_id=uid, name="overview", params=())

    def compute() -> Overview:
        rows = _fetch_positions(repo, auth)
        summary_res, holdings, conc = build_overview(rows, md)

        return Overview(
            summary=Summary(
                invested=summary_res.invested,
                totalPL=summary_res.total_pl,
                totalPLPercent=summary_res.total_pl_percent,
                openCount=summary_res.open_count,
                closedCount=summary_res.closed_count,
            ),
            holdings=[
                HoldingItem(
                    ticker=h.ticker,
                    quantity=h.quantity,
                    avgCost=h.avg_cost,
                    currentPrice=h.current_price,
                    marketValue=h.market_value,
                    unrealizedPL=h.unrealized_pl,
                    unrealizedPLPercent=h.unrealized_pl_percent,
                    weight=h.weight,
                )
                for h in holdings
            ],
            concentration=Concentration(
                top5WeightPercent=conc.top5_weight_percent,
                hhi=conc.hhi,
            ),
        )

    return cache.get_or_compute(key, compute)


@router.get("/api/analytics/performance", response_model=PerformanceResponse)
def get_performance(
    request: Request,
    userId: int | None = Query(None, description="Deprecated; user derived from token"),
    days: int = Query(365, ge=30, description="Days back to compute daily performance"),
    auth: str = Depends(require_auth_header),
    repo: PositionsRepository = Depends(get_positions_repo),
    yf: YahooFinanceClient = Depends(get_yahoo_client),
    settings: Settings = Depends(get_settings),
    cache: TTLCache = Depends(get_cache),
) -> PerformanceResponse:
    uid = get_current_user_id_from_request(request)
    days = min(days, settings.analytics_max_days)

    key = CacheKey(user_id=uid, name="performance", params=(("days", str(days)),))

    def compute() -> PerformanceResponse:
        rows = _fetch_positions(repo, auth)
        portfolio, _ = compute_portfolio_value_series(rows, days=days, yf=yf, benchmark=None)
        if portfolio.empty:
            return PerformanceResponse(days=days, points=[])

        start_val = float(portfolio.iloc[0]) if float(portfolio.iloc[0]) != 0 else 0.0

        points: list[PerformancePoint] = []
        for ts, val in portfolio.items():
            cum = ((float(val) / start_val) - 1.0) * 100.0 if start_val > 0 else 0.0
            points.append(
                PerformancePoint(
                    date=ts.strftime("%Y-%m-%d"),
                    portfolioValue=round(float(val), 2),
                    cumulativeReturnPercent=round(float(cum), 2),
                )
            )

        return PerformanceResponse(days=days, points=points)

    return cache.get_or_compute(key, compute)


@router.get("/api/analytics/risk", response_model=RiskResponse)
def get_risk(
    request: Request,
    userId: int | None = Query(None, description="Deprecated; user derived from token"),
    days: int = Query(365, ge=30, description="Days back to compute risk metrics"),
    benchmark: str = Query("SPY", min_length=1, max_length=10),
    auth: str = Depends(require_auth_header),
    repo: PositionsRepository = Depends(get_positions_repo),
    yf: YahooFinanceClient = Depends(get_yahoo_client),
    settings: Settings = Depends(get_settings),
    cache: TTLCache = Depends(get_cache),
) -> RiskResponse:
    uid = get_current_user_id_from_request(request)
    days = min(days, settings.analytics_max_days)
    bench = benchmark.strip().upper()

    key = CacheKey(user_id=uid, name="risk", params=(("days", str(days)), ("benchmark", bench)))

    def compute() -> RiskResponse:
        rows = _fetch_positions(repo, auth)
        portfolio, bench_series = compute_portfolio_value_series(
            rows, days=days, yf=yf, benchmark=bench
        )
        vol, max_dd, sharpe, beta, corr = compute_risk_metrics(portfolio, bench_series)

        return RiskResponse(
            days=days,
            benchmark=bench,
            volatilityAnnualized=round(vol, 4),
            maxDrawdownPercent=round(max_dd, 2),
            sharpeAnnualized=round(sharpe, 4),
            beta=round(beta, 4),
            correlation=round(corr, 4),
        )

    return cache.get_or_compute(key, compute)
