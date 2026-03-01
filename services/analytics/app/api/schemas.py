from __future__ import annotations

from pydantic import BaseModel, Field


class Summary(BaseModel):
    invested: float
    totalPL: float
    totalPLPercent: float
    openCount: int
    closedCount: int


class HistoryItem(BaseModel):
    date: str
    value: float


class HoldingItem(BaseModel):
    ticker: str
    quantity: float
    avgCost: float
    currentPrice: float | None = None
    marketValue: float | None = None
    unrealizedPL: float | None = None
    unrealizedPLPercent: float | None = None
    weight: float | None = None


class Concentration(BaseModel):
    top5WeightPercent: float = Field(..., description="Sum of top 5 weights (%)")
    hhi: float = Field(..., description="Herfindahl–Hirschman Index (0..1)")


class Overview(BaseModel):
    summary: Summary
    holdings: list[HoldingItem]
    concentration: Concentration


class PerformancePoint(BaseModel):
    date: str
    portfolioValue: float
    cumulativeReturnPercent: float


class PerformanceResponse(BaseModel):
    days: int
    points: list[PerformancePoint]


class RiskResponse(BaseModel):
    days: int
    benchmark: str
    volatilityAnnualized: float
    maxDrawdownPercent: float
    sharpeAnnualized: float
    beta: float
    correlation: float
