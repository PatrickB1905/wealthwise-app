from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import QuoteSnapshot


def _utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _norm_symbol(sym: str) -> str:
    return (sym or "").strip().upper()


class QuoteSnapshotsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_many(self, symbols: list[str]) -> dict[str, QuoteSnapshot]:
        syms = [_norm_symbol(s) for s in symbols if str(s).strip()]
        if not syms:
            return {}

        stmt = select(QuoteSnapshot).where(QuoteSnapshot.symbol.in_(syms))
        res = await self._session.execute(stmt)
        rows = list(res.scalars().all())
        return {r.symbol: r for r in rows}

    async def upsert_many(self, quotes: list[dict[str, Any]]) -> None:
        if not quotes:
            return

        now = _utc_now_naive()

        by_sym: dict[str, dict[str, Any]] = {}
        for q in quotes:
            if not isinstance(q, dict):
                continue
            sym = _norm_symbol(str(q.get("symbol", "")))
            if not sym:
                continue
            by_sym[sym] = q

        if not by_sym:
            return

        existing = await self.get_many(list(by_sym.keys()))

        for sym, q in by_sym.items():
            cur = q.get("currentPrice")
            pct = q.get("dailyChangePercent")
            logo = q.get("logoUrl") or ""

            if not isinstance(cur, (int, float)) or not isinstance(pct, (int, float)):
                continue

            row = existing.get(sym)
            if row is None:
                row = QuoteSnapshot(
                    symbol=sym,
                    currentPrice=float(cur),
                    dailyChangePercent=float(pct),
                    logoUrl=str(logo),
                    updatedAt=now,
                )
                self._session.add(row)
            else:
                row.currentPrice = float(cur)
                row.dailyChangePercent = float(pct)
                if isinstance(logo, str) and logo.strip():
                    row.logoUrl = logo
                row.updatedAt = now
