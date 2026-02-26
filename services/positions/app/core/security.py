from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, cast

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from starlette.requests import Request

from app.core.config import Settings

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)

bearer = HTTPBearer(auto_error=False)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    return cast(str, pwd_context.hash(password))


def verify_password(password: str, password_hash: str) -> bool:
    return cast(bool, pwd_context.verify(password, password_hash))


def create_access_token(user_id: int, secret: str, expires_seconds: int) -> str:
    now = _utcnow()
    payload: dict[str, Any] = {
        "userId": int(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=expires_seconds)).timestamp()),
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    return cast(str, token)


def get_settings(request: Request) -> Settings:
    return cast(Settings, request.app.state.settings)


def get_current_user_id(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    settings: Settings = Depends(get_settings),
) -> int:
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    token = creds.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired") from None
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or missing token") from None

    uid_raw = payload.get("userId") if isinstance(payload, dict) else None
    if not isinstance(uid_raw, int):
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    return uid_raw
