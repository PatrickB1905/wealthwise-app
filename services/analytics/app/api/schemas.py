from __future__ import annotations

from pydantic import BaseModel


class Summary(BaseModel):
    invested: float
    totalPL: float
    totalPLPercent: float
    openCount: int
    closedCount: int


class HistoryItem(BaseModel):
    date: str
    value: float
