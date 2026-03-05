from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import jwt
from fastapi import HTTPException
from starlette.requests import Request

from app.core.config import Settings


def require_bearer_auth_header(request: Request) -> str:
    auth = request.headers.get("authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    return auth


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_settings_from_request(request: Request) -> Settings:
    return request.app.state.settings


def get_current_user_id_from_request(request: Request) -> int:
    auth = require_bearer_auth_header(request)
    token = auth.split(" ", 1)[1].strip()

    settings = get_settings_from_request(request)

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired") from None
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or missing token") from None

    uid_raw: Any = payload.get("userId") if isinstance(payload, dict) else None
    if not isinstance(uid_raw, int):
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    return uid_raw
