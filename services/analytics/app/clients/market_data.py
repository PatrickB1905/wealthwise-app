from __future__ import annotations

import logging
import time

import httpx

log = logging.getLogger(__name__)


class MarketDataClient:
    def __init__(
        self,
        base_url: str,
        http: httpx.Client,
        timeout_seconds: float = 5.0,
        retries: int = 2,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._http = http
        self._timeout = timeout_seconds
        self._retries = max(0, retries)

    def fetch_quotes(self, symbols: set[str]) -> dict[str, float]:
        if not symbols:
            return {}

        symbols_param = ",".join(sorted(symbols))
        url = f"{self._base_url}/quotes"

        last_exc: Exception | None = None

        for attempt in range(self._retries + 1):
            try:
                resp = self._http.get(
                    url,
                    params={"symbols": symbols_param},
                    timeout=self._timeout,
                )
                resp.raise_for_status()

                data = resp.json()
                return {str(q["symbol"]): float(q["currentPrice"]) for q in data}

            except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
                last_exc = exc
                if attempt < self._retries:
                    sleep_s = 0.25 * (2**attempt)
                    log.warning(
                        "Market Data fetch failed (attempt %s): %s", attempt + 1, exc
                    )
                    time.sleep(sleep_s)
                    continue

        log.warning("Market Data fetch failed (giving up): %s", last_exc)
        raise RuntimeError("Market data unavailable") from last_exc
