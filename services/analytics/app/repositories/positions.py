from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any

import httpx


@dataclass(frozen=True)
class PositionRow:
    quantity: float
    buy_price: float
    sell_price: float | None
    sell_date: datetime | None
    ticker: str
    buy_date: datetime | None


class PositionsRepository:
    """
    Read-only repository backed by the Positions Service API.

    IMPORTANT:
    - Positions service uses JWT auth (user derived from token), not userId query param.
    - Analytics must forward the incoming Authorization header.
    """

    def __init__(self, base_url: str, http: httpx.Client, timeout_seconds: float = 5.0) -> None:
        self._base_url = base_url.rstrip("/")
        self._http = http
        self._timeout = timeout_seconds

    def list_for_current_user(self, auth_header: str) -> list[PositionRow]:
        open_rows = self._fetch_positions(auth_header=auth_header, status="open")
        closed_rows = self._fetch_positions(auth_header=auth_header, status="closed")
        return [*open_rows, *closed_rows]

    def _fetch_positions(self, auth_header: str, status: str) -> list[PositionRow]:
        url = f"{self._base_url}/positions"
        resp = self._http.get(
            url,
            params={"status": status},
            headers={"Authorization": auth_header},
            timeout=self._timeout,
        )
        resp.raise_for_status()

        payload = resp.json()
        if not isinstance(payload, list):
            raise RuntimeError("Positions service returned non-list payload")

        return [self._parse_row(item) for item in payload]

    def _parse_row(self, item: dict[str, Any]) -> PositionRow:
        # PositionResponse fields from positions service:
        # quantity, buyPrice, sellPrice, sellDate, ticker, buyDate
        def get(*keys: str) -> Any:
            for k in keys:
                if k in item:
                    return item[k]
            return None

        quantity = float(get("quantity") or 0.0)
        buy_price = float(get("buyPrice", "buy_price") or 0.0)

        sell_price_raw = get("sellPrice", "sell_price")
        sell_price = float(sell_price_raw) if sell_price_raw is not None else None

        ticker = str(get("ticker") or "")

        buy_date = self._parse_dt(get("buyDate", "buy_date"))
        sell_date = self._parse_dt(get("sellDate", "sell_date"))

        return PositionRow(
            quantity=quantity,
            buy_price=buy_price,
            sell_price=sell_price,
            sell_date=sell_date,
            ticker=ticker,
            buy_date=buy_date,
        )

    @staticmethod
    def _parse_dt(value: Any) -> datetime | None:
        if value in (None, ""):
            return None
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        return None
