from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, cast

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from app.api.schemas import (
    AuthLoginRequest,
    AuthLoginResponse,
    AuthMeResponse,
    AuthRegisterRequest,
    AuthRegisterResponse,
    AuthUpdateEmailRequest,
    AuthUpdatePasswordRequest,
    PositionCloseRequest,
    PositionCreateRequest,
    PositionResponse,
    PositionUpdateRequest,
)
from app.core.config import Settings
from app.core.security import (
    create_access_token,
    get_current_user_id,
    hash_password,
    verify_password,
)
from app.db.engine import get_session
from app.repositories.positions import PositionsRepository
from app.repositories.quote_snapshots import QuoteSnapshotsRepository
from app.repositories.users import UsersRepository
from app.services.market_data import fetch_quotes_from_market_data
from app.services.realtime import Emitter

log = logging.getLogger(__name__)
router = APIRouter()


def get_settings(request: Request) -> Settings:
    return cast(Settings, request.app.state.settings)


def get_emitter(request: Request) -> Emitter:
    return cast(Emitter, request.app.state.emitter)


def _normalize_status(status: str) -> str:
    s = (status or "").strip().lower()
    return s or "open"


def _norm_email(email: str) -> str:
    return (email or "").strip().lower()


@router.get("/api/health")
async def health() -> dict[str, object]:
    return {"status": "OK"}


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(tzinfo=None).isoformat()


@router.post("/api/auth/register", response_model=AuthRegisterResponse, status_code=201)
async def register(
    payload: AuthRegisterRequest,
    settings: Settings = Depends(get_settings),
    session: AsyncSession = Depends(get_session),
) -> AuthRegisterResponse:
    users = UsersRepository(session=session)

    first = payload.firstName.strip()
    last = payload.lastName.strip()
    email = _norm_email(payload.email)
    password = payload.password or ""

    if not first or not last:
        raise HTTPException(status_code=400, detail="First name and last name are required.")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    existing = await users.get_by_email(email)
    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="That email is already registered. Please log in or choose another.",
        )

    try:
        pw_hash = hash_password(password)
    except Exception:
        log.exception("Password hashing failed")
        raise HTTPException(
            status_code=500,
            detail="Server misconfiguration: password hashing unavailable.",
        ) from None

    try:
        user = await users.create(
            email=email,
            password_hash=pw_hash,
            first_name=first,
            last_name=last,
        )
    except UsersRepository.EmailAlreadyExists:
        raise HTTPException(
            status_code=409,
            detail="That email is already registered. Please log in or choose another.",
        ) from None

    token = create_access_token(
        user_id=user.id,
        secret=settings.jwt_secret,
        expires_seconds=3600,
    )

    return AuthRegisterResponse(
        token=token,
        user={
            "id": user.id,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "createdAt": user.createdAt.isoformat(),
        },
    )


@router.post("/api/auth/login", response_model=AuthLoginResponse)
async def login(
    payload: AuthLoginRequest,
    settings: Settings = Depends(get_settings),
    session: AsyncSession = Depends(get_session),
) -> AuthLoginResponse:
    users = UsersRepository(session=session)

    email = _norm_email(payload.email)
    password = payload.password or ""

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    user = await users.get_by_email(email)

    try:
        ok = user is not None and verify_password(password, user.password)
    except Exception:
        log.exception("Password verification failed")
        raise HTTPException(
            status_code=500,
            detail="Server misconfiguration: password verification unavailable.",
        ) from None

    if not ok:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    assert user is not None

    token = create_access_token(
        user_id=user.id,
        secret=settings.jwt_secret,
        expires_seconds=3600,
    )

    return AuthLoginResponse(
        token=token,
        user={
            "id": user.id,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "createdAt": user.createdAt.isoformat(),
        },
    )


@router.get("/api/auth/me", response_model=AuthMeResponse)
async def me(
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> AuthMeResponse:
    users = UsersRepository(session=session)
    user = await users.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return AuthMeResponse(
        id=user.id,
        firstName=user.firstName,
        lastName=user.lastName,
        email=user.email,
        createdAt=user.createdAt.isoformat(),
    )


@router.put("/api/auth/me/email")
async def update_email(
    payload: AuthUpdateEmailRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    users = UsersRepository(session=session)

    email = _norm_email(payload.email)
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    try:
        updated = await users.update_email(user_id=user_id, email=email)
    except UsersRepository.EmailAlreadyExists:
        raise HTTPException(
            status_code=409, detail="The following email is already in use."
        ) from None

    return {"email": updated.email}


@router.put("/api/auth/me/password")
async def update_password(
    payload: AuthUpdatePasswordRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    users = UsersRepository(session=session)

    if not payload.currentPassword or not payload.newPassword:
        raise HTTPException(status_code=400, detail="Current and new password are required")

    user = await users.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        ok = verify_password(payload.currentPassword, user.password)
    except Exception:
        log.exception("Password verification failed")
        raise HTTPException(
            status_code=500,
            detail="Server misconfiguration: password verification unavailable.",
        ) from None

    if not ok:
        raise HTTPException(status_code=400, detail="Current password incorrect")

    try:
        new_hash = hash_password(payload.newPassword)
    except Exception:
        log.exception("Password hashing failed")
        raise HTTPException(
            status_code=500,
            detail="Server misconfiguration: password hashing unavailable.",
        ) from None

    await users.update_password(user_id=user_id, password_hash=new_hash)
    return {"message": "Password updated"}


@router.delete("/api/auth/me", status_code=204)
async def delete_me(
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> Response:
    positions = PositionsRepository(session=session)
    users = UsersRepository(session=session)

    await positions.delete_many_for_user(user_id=user_id)
    await users.delete(user_id=user_id)
    return Response(status_code=204)


@router.get("/api/positions", response_model=list[PositionResponse])
async def list_positions(
    status: str = Query("open"),
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> list[PositionResponse]:
    status_norm = _normalize_status(status)
    if status_norm not in {"open", "closed"}:
        raise HTTPException(status_code=400, detail="status must be 'open' or 'closed'")

    repo = PositionsRepository(session=session)
    rows = await repo.list_for_user(user_id=user_id, status=status_norm)
    return [PositionResponse.from_model(p) for p in rows]


@router.post("/api/positions", response_model=PositionResponse, status_code=201)
async def create_position(
    payload: PositionCreateRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
    emitter: Emitter = Depends(get_emitter),
    settings: Settings = Depends(get_settings),
) -> PositionResponse:
    repo = PositionsRepository(session=session)

    if not payload.ticker.strip():
        raise HTTPException(status_code=400, detail="ticker, quantity and buyPrice are required")

    ticker = payload.ticker.strip().upper()

    pos = await repo.create(
        user_id=user_id,
        ticker=ticker,
        quantity=float(payload.quantity),
        buy_price=float(payload.buyPrice),
        buy_date=payload.buyDate,
    )

    await emitter.emit(
        room=f"user_{user_id}",
        event="position:added",
        data=PositionResponse.from_model(pos).model_dump(),
    )

    try:
        quotes = await asyncio.to_thread(
            fetch_quotes_from_market_data,
            settings.market_data_service_url,
            [ticker],
        )
        if quotes:
            snaps = QuoteSnapshotsRepository(session=session)
            await snaps.upsert_many(quotes)
            await session.commit()

            now_iso = datetime.now(timezone.utc).replace(tzinfo=None).isoformat()

            payload_out: list[dict[str, Any]] = []
            for q in quotes:
                if not isinstance(q, dict):
                    continue
                sym = str(q.get("symbol") or "").strip().upper()
                if not sym:
                    continue
                payload_out.append(
                    {
                        "symbol": sym,
                        "currentPrice": q.get("currentPrice"),
                        "dailyChangePercent": q.get("dailyChangePercent"),
                        "logoUrl": q.get("logoUrl") or "",
                        "updatedAt": now_iso,
                    }
                )

            if payload_out:
                await emitter.emit(
                    room=f"user_{user_id}",
                    event="price:update",
                    data=payload_out,
                )
    except Exception:
        log.exception(
            "quote prefetch failed for newly-created position ticker=%s user_id=%s",
            ticker,
            user_id,
        )
        await session.rollback()

    return PositionResponse.from_model(pos)


@router.put("/api/positions/{position_id}/close", response_model=PositionResponse)
async def close_position(
    position_id: int,
    payload: PositionCloseRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
    emitter: Emitter = Depends(get_emitter),
) -> PositionResponse:
    repo = PositionsRepository(session=session)

    pos = await repo.close(
        user_id=user_id,
        position_id=position_id,
        sell_price=float(payload.sellPrice),
        sell_date=payload.sellDate,
    )
    if pos is None:
        raise HTTPException(status_code=404, detail="Position not found or already closed")

    await emitter.emit(
        room=f"user_{user_id}",
        event="position:closed",
        data=PositionResponse.from_model(pos).model_dump(),
    )
    return PositionResponse.from_model(pos)


@router.put("/api/positions/{position_id}", response_model=PositionResponse)
async def update_position(
    position_id: int,
    payload: PositionUpdateRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
    emitter: Emitter = Depends(get_emitter),
) -> PositionResponse:
    repo = PositionsRepository(session=session)

    pos = await repo.update(
        user_id=user_id,
        position_id=position_id,
        quantity=float(payload.quantity),
        buy_price=float(payload.buyPrice),
        buy_date=payload.buyDate,
        sell_price=float(payload.sellPrice) if payload.sellPrice is not None else None,
        sell_date=payload.sellDate,
    )
    if pos is None:
        raise HTTPException(status_code=404, detail="Position not found")

    await emitter.emit(
        room=f"user_{user_id}",
        event="position:updated",
        data=PositionResponse.from_model(pos).model_dump(),
    )
    return PositionResponse.from_model(pos)


@router.delete("/api/positions/{position_id}", status_code=204)
async def delete_position(
    position_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
    emitter: Emitter = Depends(get_emitter),
) -> Response:
    repo = PositionsRepository(session=session)
    ok = await repo.delete(user_id=user_id, position_id=position_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Position not found")

    await emitter.emit(
        room=f"user_{user_id}",
        event="position:deleted",
        data={"id": position_id},
    )
    return Response(status_code=204)
