from __future__ import annotations

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.core.config import Settings
from app.core.security import create_access_token, get_current_user_id


def _long_secret() -> str:
    return "secret-at-least-32-bytes-long-000000000000"


def test_create_access_token_and_get_current_user_id():
    s = Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET=_long_secret(),
        FRONTEND_ORIGIN="http://localhost:5173",
    )
    token = create_access_token(user_id=123, secret=s.jwt_secret, expires_seconds=3600)
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    assert get_current_user_id(creds=creds, settings=s) == 123


def test_get_current_user_id_missing_token_raises():
    s = Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET=_long_secret(),
        FRONTEND_ORIGIN="http://localhost:5173",
    )
    with pytest.raises(HTTPException) as exc:
        get_current_user_id(creds=None, settings=s)
    assert exc.value.status_code == 401


def test_get_current_user_id_invalid_token_raises():
    s = Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET=_long_secret(),
        FRONTEND_ORIGIN="http://localhost:5173",
    )
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="not-a-real-jwt")
    with pytest.raises(HTTPException) as exc:
        get_current_user_id(creds=creds, settings=s)
    assert exc.value.status_code == 401
