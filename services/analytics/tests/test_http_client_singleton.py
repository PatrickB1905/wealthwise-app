from __future__ import annotations

from app.api import routes
from app.core.config import Settings
from app.main import create_app
from starlette.requests import Request


def _make_request(app):
    scope = {
        "type": "http",
        "http_version": "1.1",
        "method": "GET",
        "path": "/",
        "headers": [],
        "app": app,
    }

    async def receive():
        return {"type": "http.request"}

    return Request(scope, receive)


def test_get_http_client_is_cached_on_app_state():
    app = create_app(Settings())

    req1 = _make_request(app)
    c1 = routes.get_http_client(req1)

    req2 = _make_request(app)
    c2 = routes.get_http_client(req2)

    assert c1 is c2
    assert getattr(app.state, "http_client", None) is c1
