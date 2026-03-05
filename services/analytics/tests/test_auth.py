from __future__ import annotations

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import jwt
import pytest
from app.core.auth import get_current_user_id_from_request
from app.core.config import Settings
from fastapi import HTTPException
from starlette.requests import Request
from starlette.types import Scope


def _make_request(auth_header: str | None, settings: Settings) -> Request:
    app = SimpleNamespace(state=SimpleNamespace(settings=settings))

    scope: Scope = {
        "type": "http",
        "method": "GET",
        "path": "/x",
        "headers": [],
        "app": app,
        "query_string": b"",
        "server": ("testserver", 80),
        "client": ("testclient", 123),
        "scheme": "http",
        "root_path": "",
    }

    req = Request(scope)
    if auth_header is not None:
        req.scope["headers"] = [(b"authorization", auth_header.encode("utf-8"))]
    else:
        req.scope["headers"] = []

    return req


def test_get_current_user_id_from_request_happy_path():
    settings = Settings(JWT_SECRET="x" * 32)

    now = datetime.now(timezone.utc)
    payload = {
        "userId": 123,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=5)).timestamp()),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    req = _make_request(f"Bearer {token}", settings)

    uid = get_current_user_id_from_request(req)
    assert uid == 123


def test_get_current_user_id_from_request_expired_token():
    settings = Settings(JWT_SECRET="x" * 32)

    now = datetime.now(timezone.utc)
    payload = {
        "userId": 123,
        "iat": int((now - timedelta(minutes=10)).timestamp()),
        "exp": int((now - timedelta(minutes=5)).timestamp()),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    req = _make_request(f"Bearer {token}", settings)

    with pytest.raises(HTTPException) as exc:
        get_current_user_id_from_request(req)

    assert exc.value.status_code == 401
    assert "expired" in str(exc.value.detail).lower()
