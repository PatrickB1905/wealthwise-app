from __future__ import annotations

from typing import Any

import jwt
import pytest
from fastapi import FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from starlette.requests import Request

import app.core.security as security_mod
from app.core.config import Settings


def _settings() -> Settings:
    return Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET="test-secret-at-least-32-bytes-long-00000000",
        FRONTEND_ORIGIN="http://localhost:5173",
        LOG_LEVEL="INFO",
    )


def test_hash_and_verify_password_are_called(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(security_mod.pwd_context, "hash", lambda pw: f"HASH:{pw}")
    monkeypatch.setattr(security_mod.pwd_context, "verify", lambda pw, h: h == f"HASH:{pw}")

    h = security_mod.hash_password("pw")
    assert h == "HASH:pw"
    assert security_mod.verify_password("pw", h) is True
    assert security_mod.verify_password("nope", h) is False


def test_create_access_token_roundtrip_user_id_int() -> None:
    s = _settings()
    token = security_mod.create_access_token(user_id=123, secret=s.jwt_secret, expires_seconds=60)
    payload: dict[str, Any] = jwt.decode(token, s.jwt_secret, algorithms=["HS256"])
    assert payload["userId"] == 123
    assert "iat" in payload
    assert "exp" in payload


def test_get_settings_helper() -> None:
    app = FastAPI()
    app.state.settings = _settings()

    scope: dict[str, Any] = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": [],
        "app": app,
    }
    req = Request(scope)

    got = security_mod.get_settings(req)
    assert got.jwt_secret == app.state.settings.jwt_secret


def test_get_current_user_id_missing_creds_raises() -> None:
    with pytest.raises(HTTPException) as e:
        security_mod.get_current_user_id(creds=None, settings=_settings())
    assert e.value.status_code == 401


def test_get_current_user_id_invalid_token_raises() -> None:
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="not-a-jwt")
    with pytest.raises(HTTPException) as e:
        security_mod.get_current_user_id(creds=creds, settings=_settings())
    assert e.value.status_code == 401


def test_get_current_user_id_userid_not_int_raises() -> None:
    s = _settings()
    token = jwt.encode({"userId": "7"}, s.jwt_secret, algorithm="HS256")
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    with pytest.raises(HTTPException) as e:
        security_mod.get_current_user_id(creds=creds, settings=s)
    assert e.value.status_code == 401
