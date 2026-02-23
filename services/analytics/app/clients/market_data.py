from __future__ import annotations

import logging

import httpx

log = logging.getLogger(__name__)


class MarketDataClient:
    def __init__(self, base_url: str, timeout_seconds: float = 5.0) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout_seconds

    def fetch_quotes(self, symbols: set[str]) -> dict[str, float]:
        if not symbols:
            return {}

        symbols_param = ",".join(sorted(symbols))

        try:
            with httpx.Client(timeout=self._timeout) as client:
                resp = client.get(
                    f"{self._base_url}/quotes",
                    params={"symbols": symbols_param},
                )
                resp.raise_for_status()

            data = resp.json()
            return {str(q["symbol"]): float(q["currentPrice"]) for q in data}
        except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
            log.exception("Market Data fetch failed")
            raise RuntimeError("Market data unavailable") from exc
