from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Position


def _normalize_status(status: str) -> str:
    s = (status or "").strip().lower()
    return s or "open"


def _utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _to_utc_naive(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


class PositionsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_for_user(self, user_id: int, status: str) -> list[Position]:
        status_norm = _normalize_status(status)

        stmt = select(Position).where(Position.userId == user_id)

        if status_norm == "open":
            stmt = stmt.where(Position.sellDate.is_(None))
        elif status_norm == "closed":
            stmt = stmt.where(Position.sellDate.is_not(None))
        else:
            return []

        stmt = stmt.order_by(Position.buyDate.desc())
        res = await self._session.execute(stmt)
        return list(res.scalars().all())

    async def create(
        self,
        user_id: int,
        ticker: str,
        quantity: float,
        buy_price: float,
        buy_date: datetime | None,
    ) -> Position:
        buy_dt = _to_utc_naive(buy_date) if buy_date is not None else _utc_now_naive()

        pos = Position(
            userId=user_id,
            ticker=ticker,
            quantity=quantity,
            buyPrice=buy_price,
            buyDate=buy_dt,
            sellPrice=None,
            sellDate=None,
        )
        self._session.add(pos)

        try:
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

        await self._session.refresh(pos)
        return pos

    async def close(
        self,
        user_id: int,
        position_id: int,
        sell_price: float,
        sell_date: datetime | None,
    ) -> Position | None:
        res = await self._session.execute(select(Position).where(Position.id == position_id))
        existing = res.scalar_one_or_none()
        if existing is None or existing.userId != user_id or existing.sellDate is not None:
            return None

        sell_dt = _to_utc_naive(sell_date) if sell_date is not None else _utc_now_naive()

        try:
            await self._session.execute(
                update(Position)
                .where(Position.id == position_id)
                .values(sellPrice=sell_price, sellDate=sell_dt)
            )
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

        res2 = await self._session.execute(select(Position).where(Position.id == position_id))
        return res2.scalar_one()

    async def update(
        self,
        user_id: int,
        position_id: int,
        quantity: float,
        buy_price: float,
        buy_date: datetime | None,
        sell_price: float | None,
        sell_date: datetime | None,
    ) -> Position | None:
        res = await self._session.execute(select(Position).where(Position.id == position_id))
        existing = res.scalar_one_or_none()
        if existing is None or existing.userId != user_id:
            return None

        values: dict[str, object] = {"quantity": quantity, "buyPrice": buy_price}

        if buy_date is not None:
            values["buyDate"] = _to_utc_naive(buy_date)
        if sell_price is not None:
            values["sellPrice"] = sell_price
        if sell_date is not None:
            values["sellDate"] = _to_utc_naive(sell_date)

        try:
            await self._session.execute(
                update(Position).where(Position.id == position_id).values(**values)
            )
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

        res2 = await self._session.execute(select(Position).where(Position.id == position_id))
        return res2.scalar_one()

    async def delete(self, user_id: int, position_id: int) -> bool:
        res = await self._session.execute(select(Position).where(Position.id == position_id))
        existing = res.scalar_one_or_none()
        if existing is None or existing.userId != user_id:
            return False

        try:
            await self._session.execute(delete(Position).where(Position.id == position_id))
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

        return True

    async def delete_many_for_user(self, user_id: int) -> None:
        try:
            await self._session.execute(delete(Position).where(Position.userId == user_id))
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

    async def list_open_tickers_grouped_by_user(self) -> dict[int, list[str]]:
        res = await self._session.execute(
            select(Position.userId, Position.ticker).where(Position.sellDate.is_(None))
        )
        by_user: dict[int, list[str]] = {}
        for uid, ticker in res.all():
            by_user.setdefault(int(uid), []).append(str(ticker))
        return by_user
