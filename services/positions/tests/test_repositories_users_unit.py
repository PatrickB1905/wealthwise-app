from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.exc import IntegrityError

from app.repositories.users import UsersRepository


@dataclass
class FakeUser:
    id: int
    email: str
    password: str
    createdAt: datetime
    updatedAt: datetime
    firstName: str
    lastName: str


class _FakeResult:
    def __init__(self, scalar: Any) -> None:
        self._scalar = scalar

    def scalar_one_or_none(self) -> Any:
        return self._scalar


class FakeSession:
    def __init__(self) -> None:
        self._queue: list[_FakeResult] = []
        self.added: list[Any] = []
        self._commit_raises: Exception | None = None
        self._rolled_back = 0
        self._refreshed = 0

    def queue(self, *results: _FakeResult) -> None:
        self._queue.extend(results)

    def set_commit_error(self, exc: Exception | None) -> None:
        self._commit_raises = exc

    def add(self, obj: Any) -> None:
        self.added.append(obj)

    async def execute(self, stmt: Any) -> _FakeResult:
        assert self._queue, "No queued results"
        return self._queue.pop(0)

    async def commit(self) -> None:
        if self._commit_raises is not None:
            raise self._commit_raises

    async def rollback(self) -> None:
        self._rolled_back += 1

    async def refresh(self, obj: Any) -> None:
        self._refreshed += 1
        if getattr(obj, "id", None) is None:
            obj.id = 1  # type: ignore[attr-defined]


def _integrity_error() -> IntegrityError:
    return IntegrityError("stmt", {}, Exception("orig"))


def test_get_by_email_and_id():
    session = FakeSession()
    repo = UsersRepository(session=session)  # type: ignore[arg-type]

    u = FakeUser(
        id=1,
        email="a@b.com",
        password="HASH:pw",
        createdAt=datetime.now(timezone.utc),
        updatedAt=datetime.now(timezone.utc),
        firstName="A",
        lastName="B",
    )

    session.queue(_FakeResult(u))
    assert asyncio.run(repo.get_by_email("a@b.com")) == u

    session.queue(_FakeResult(u))
    assert asyncio.run(repo.get_by_id(1)) == u


def test_create_success_and_duplicate_email():
    session = FakeSession()
    repo = UsersRepository(session=session)  # type: ignore[arg-type]

    user = asyncio.run(
        repo.create(email="a@b.com", password_hash="HASH:pw", first_name="A", last_name="B")
    )
    assert session.added
    assert session._refreshed == 1
    assert user.email == "a@b.com"

    session2 = FakeSession()
    session2.set_commit_error(_integrity_error())
    repo2 = UsersRepository(session=session2)  # type: ignore[arg-type]

    try:
        asyncio.run(
            repo2.create(
                email="dup@b.com",
                password_hash="HASH:pw",
                first_name="A",
                last_name="B",
            )
        )
        raise AssertionError("Expected EmailAlreadyExists")
    except UsersRepository.EmailAlreadyExists:
        pass
    assert session2._rolled_back == 1


def test_update_email_success_and_conflict():
    session = FakeSession()
    repo = UsersRepository(session=session)  # type: ignore[arg-type]

    u = FakeUser(
        id=1,
        email="new@b.com",
        password="HASH:pw",
        createdAt=datetime.now(timezone.utc),
        updatedAt=datetime.now(timezone.utc),
        firstName="A",
        lastName="B",
    )
    session.queue(_FakeResult(None), _FakeResult(u))
    out = asyncio.run(repo.update_email(user_id=1, email="new@b.com"))
    assert out == u

    session2 = FakeSession()
    session2.set_commit_error(_integrity_error())
    repo2 = UsersRepository(session=session2)  # type: ignore[arg-type]
    session2.queue(_FakeResult(None))
    try:
        asyncio.run(repo2.update_email(user_id=1, email="dup@b.com"))
        raise AssertionError("Expected EmailAlreadyExists")
    except UsersRepository.EmailAlreadyExists:
        pass
    assert session2._rolled_back == 1


def test_update_password_and_delete():
    session = FakeSession()
    repo = UsersRepository(session=session)  # type: ignore[arg-type]

    session.queue(_FakeResult(None))
    asyncio.run(repo.update_password(user_id=1, password_hash="HASH:new"))

    session.queue(_FakeResult(None))
    asyncio.run(repo.delete(user_id=1))
