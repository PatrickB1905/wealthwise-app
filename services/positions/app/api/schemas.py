from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.db.models import Position


class AuthRegisterRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str


class AuthLoginRequest(BaseModel):
    email: str
    password: str


class AuthRegisterResponse(BaseModel):
    token: str
    user: dict[str, Any]


class AuthLoginResponse(BaseModel):
    token: str
    user: dict[str, Any]


class AuthMeResponse(BaseModel):
    id: int
    firstName: str
    lastName: str
    email: str
    createdAt: str


class AuthUpdateEmailRequest(BaseModel):
    email: str


class AuthUpdatePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


class PositionCreateRequest(BaseModel):
    ticker: str
    quantity: float = Field(..., gt=0)
    buyPrice: float = Field(..., gt=0)
    buyDate: datetime


class PositionCloseRequest(BaseModel):
    sellPrice: float
    sellDate: datetime


class PositionUpdateRequest(BaseModel):
    quantity: float = Field(..., gt=0)
    buyPrice: float = Field(..., gt=0)
    buyDate: datetime
    sellPrice: float | None = None
    sellDate: datetime | None = None


class PositionResponse(BaseModel):
    id: int
    ticker: str
    quantity: float
    buyPrice: float
    buyDate: str
    sellPrice: float | None = None
    sellDate: str | None = None

    @staticmethod
    def from_model(p: Position) -> PositionResponse:
        return PositionResponse(
            id=p.id,
            ticker=p.ticker,
            quantity=float(p.quantity),
            buyPrice=float(p.buyPrice),
            buyDate=p.buyDate.isoformat(),
            sellPrice=float(p.sellPrice) if p.sellPrice is not None else None,
            sellDate=p.sellDate.isoformat() if p.sellDate is not None else None,
        )
