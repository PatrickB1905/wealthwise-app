from __future__ import annotations

import json
import logging
import urllib.parse
import urllib.request
from typing import Any

log = logging.getLogger(__name__)


def _build_quotes_url(base_api_url: str, symbols: list[str]) -> str:
    base = base_api_url.rstrip("/")
    qs = urllib.parse.urlencode({"symbols": ",".join(symbols)})
    return f"{base}/quotes?{qs}"


def fetch_quotes_from_market_data(base_api_url: str, symbols: list[str]) -> list[dict[str, Any]]:
    if not symbols:
        return []

    url = _build_quotes_url(base_api_url, symbols)

    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")
        data = json.loads(raw)
        if not isinstance(data, list):
            return []
        return [x for x in data if isinstance(x, dict)]
    except Exception as exc:
        log.warning("market-data quotes fetch failed: %s", exc)
        return []
