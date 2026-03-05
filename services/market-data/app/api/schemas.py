from __future__ import annotations

from pydantic import BaseModel


class Quote(BaseModel):
    symbol: str
    currentPrice: float
    dailyChangePercent: float
    logoUrl: str
