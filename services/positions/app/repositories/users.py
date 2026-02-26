from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User


def _utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class UsersRepository:
    class EmailAlreadyExists(Exception):
        pass

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_email(self, email: str) -> User | None:
        res = await self._session.execute(select(User).where(User.email == email))
        return res.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> User | None:
        res = await self._session.execute(select(User).where(User.id == user_id))
        return res.scalar_one_or_none()

    async def create(
        self,
        email: str,
        password_hash: str,
        first_name: str,
        last_name: str,
    ) -> User:
        now = _utc_now_naive()
        user = User(
            email=email,
            password=password_hash,
            createdAt=now,
            updatedAt=now,
            firstName=first_name,
            lastName=last_name,
        )

        self._session.add(user)
        try:
            await self._session.commit()
        except IntegrityError as exc:
            await self._session.rollback()
            raise self.EmailAlreadyExists from exc

        await self._session.refresh(user)
        return user

    async def update_email(self, user_id: int, email: str) -> User:
        now = _utc_now_naive()
        try:
            await self._session.execute(
                update(User).where(User.id == user_id).values(email=email, updatedAt=now)
            )
            await self._session.commit()
        except IntegrityError as exc:
            await self._session.rollback()
            raise self.EmailAlreadyExists from exc

        user = await self.get_by_id(user_id)
        assert user is not None
        return user

    async def update_password(self, user_id: int, password_hash: str) -> None:
        now = _utc_now_naive()
        try:
            await self._session.execute(
                update(User)
                .where(User.id == user_id)
                .values(
                    password=password_hash,
                    updatedAt=now,
                )
            )
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

    async def delete(self, user_id: int) -> None:
        try:
            await self._session.execute(delete(User).where(User.id == user_id))
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
