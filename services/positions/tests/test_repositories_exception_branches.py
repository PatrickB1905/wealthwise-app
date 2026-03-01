from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

import pytest

from app.repositories.positions import PositionsRepository
from app.repositories.users import UsersRepository


class FakeSessionPositions:
    def __init__(self) -> None:
        self.added: list[Any] = []
        self._commit_error: Exception | None = None
        self._rolled_back = 0

    def add(self, obj: Any) -> None:
        self.added.append(obj)

    async def execute(self, stmt: Any) -> Any:
        raise AssertionError("execute should not be called in this test")

    async def commit(self) -> None:
        if self._commit_error is not None:
            raise self._commit_error

    async def rollback(self) -> None:
        self._rolled_back += 1

    async def refresh(self, obj: Any) -> None:
        return


def test_positions_create_rolls_back_on_commit_error() -> None:
    s = FakeSessionPositions()
    s._commit_error = RuntimeError("db down")
    repo = PositionsRepository(session=s)  # type: ignore[arg-type]

    with pytest.raises(RuntimeError):
        asyncio.run(
            repo.create(
                user_id=1,
                ticker="AAPL",
                quantity=1.0,
                buy_price=10.0,
                buy_date=datetime.now(timezone.utc),
            )
        )

    assert s._rolled_back == 1


class FakeSessionUsers:
    def __init__(self) -> None:
        self._commit_error: Exception | None = None
        self._rolled_back = 0

    async def execute(self, stmt: Any) -> Any:
        return None

    async def commit(self) -> None:
        if self._commit_error is not None:
            raise self._commit_error

    async def rollback(self) -> None:
        self._rolled_back += 1


def test_users_update_password_rolls_back_on_commit_error() -> None:
    s = FakeSessionUsers()
    s._commit_error = RuntimeError("db down")
    repo = UsersRepository(session=s)  # type: ignore[arg-type]

    with pytest.raises(RuntimeError):
        asyncio.run(repo.update_password(user_id=1, password_hash="HASH:new"))

    assert s._rolled_back == 1


def test_users_delete_rolls_back_on_commit_error() -> None:
    s = FakeSessionUsers()
    s._commit_error = RuntimeError("db down")
    repo = UsersRepository(session=s)  # type: ignore[arg-type]

    with pytest.raises(RuntimeError):
        asyncio.run(repo.delete(user_id=1))

    assert s._rolled_back == 1
