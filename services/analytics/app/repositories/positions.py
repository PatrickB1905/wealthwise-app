from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from sqlalchemy import text
from sqlalchemy.engine import Engine


@dataclass(frozen=True)
class PositionRow:
    quantity: float
    buy_price: float
    sell_price: Optional[float]
    sell_date: Optional[datetime]
    ticker: str
    buy_date: Optional[datetime]


class PositionsRepository:
    def __init__(self, engine: Engine) -> None:
        self._engine = engine

    def list_by_user(self, user_id: int) -> list[PositionRow]:
        sql = text(
            """
            SELECT
              quantity,
              "buyPrice"   AS buy_price,
              "sellPrice"  AS sell_price,
              "sellDate"   AS sell_date,
              ticker,
              "buyDate"    AS buy_date
            FROM "Position"
            WHERE "userId" = :uid
            """
        )

        with self._engine.connect() as conn:
            rows = conn.execute(sql, {"uid": user_id}).mappings().all()

        result: list[PositionRow] = []
        for r in rows:
            result.append(
                PositionRow(
                    quantity=float(r["quantity"]),
                    buy_price=float(r["buy_price"]),
                    sell_price=float(r["sell_price"]) if r["sell_price"] is not None else None,
                    sell_date=r["sell_date"],
                    ticker=str(r["ticker"]),
                    buy_date=r["buy_date"],
                )
            )
        return result
