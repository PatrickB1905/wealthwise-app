from __future__ import annotations

from collections.abc import AsyncGenerator, Callable
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

import app.api.routes as routes_mod
import app.core.security as security_mod
from app.core.config import Settings
from app.db.engine import get_session
from app.db.models import Base


def _normalize_status(status: str) -> str:
    s = (status or "").strip().lower()
    if not s:
        return "open"
    return s


@dataclass
class FakeUser:
    id: int
    firstName: str
    lastName: str
    email: str
    password: str
    createdAt: datetime
    updatedAt: datetime


@dataclass
class FakePosition:
    id: int
    userId: int
    ticker: str
    quantity: float
    buyPrice: float
    buyDate: datetime
    sellPrice: float | None = None
    sellDate: datetime | None = None


class FakeEmitter:
    def __init__(self) -> None:
        self.events: list[dict[str, Any]] = []

    async def emit(self, room: str, event: str, data: Any) -> None:
        self.events.append({"room": room, "event": event, "data": data})


class FakeSession:
    """Marker session; fakes ignore it."""


class FakeUsersRepository:
    class EmailAlreadyExists(Exception):
        pass

    def __init__(self, session: Any) -> None:
        self._session = session

    _by_email: dict[str, FakeUser] = {}
    _by_id: dict[int, FakeUser] = {}
    _next_id: int = 1

    @classmethod
    def reset(cls) -> None:
        cls._by_email = {}
        cls._by_id = {}
        cls._next_id = 1

    async def get_by_email(self, email: str) -> FakeUser | None:
        return type(self)._by_email.get(email)

    async def get_by_id(self, user_id: int) -> FakeUser | None:
        return type(self)._by_id.get(user_id)

    async def create(
        self,
        email: str,
        password_hash: str,
        first_name: str,
        last_name: str,
    ) -> FakeUser:
        cls = type(self)

        if email in cls._by_email:
            raise self.EmailAlreadyExists

        now = datetime.now(timezone.utc)
        user = FakeUser(
            id=cls._next_id,
            firstName=first_name,
            lastName=last_name,
            email=email,
            password=password_hash,
            createdAt=now,
            updatedAt=now,
        )

        cls._next_id += 1
        cls._by_email[email] = user
        cls._by_id[user.id] = user
        return user

    async def update_email(self, user_id: int, email: str) -> FakeUser:
        cls = type(self)

        if email in cls._by_email:
            raise self.EmailAlreadyExists

        user = cls._by_id.get(user_id)
        assert user is not None

        for k, v in list(cls._by_email.items()):
            if v.id == user_id:
                del cls._by_email[k]

        user.email = email
        user.updatedAt = datetime.now(timezone.utc)
        cls._by_email[email] = user
        return user

    async def update_password(self, user_id: int, password_hash: str) -> None:
        cls = type(self)

        user = cls._by_id.get(user_id)
        assert user is not None

        user.password = password_hash
        user.updatedAt = datetime.now(timezone.utc)

    async def delete(self, user_id: int) -> None:
        cls = type(self)

        user = cls._by_id.get(user_id)
        if user is None:
            return

        for k, v in list(cls._by_email.items()):
            if v.id == user_id:
                del cls._by_email[k]

        del cls._by_id[user_id]


class FakePositionsRepository:
    def __init__(self, session: Any) -> None:
        self._session = session

    _by_id: dict[int, FakePosition] = {}
    _next_id: int = 1

    @classmethod
    def reset(cls) -> None:
        cls._by_id = {}
        cls._next_id = 1

    async def list_for_user(self, user_id: int, status: str) -> list[FakePosition]:
        cls = type(self)

        status_norm = _normalize_status(status)
        if status_norm not in {"open", "closed"}:
            return []

        want_open = status_norm == "open"

        out: list[FakePosition] = [
            p
            for p in cls._by_id.values()
            if p.userId == user_id
            and ((p.sellDate is None) if want_open else (p.sellDate is not None))
        ]
        out.sort(key=lambda x: x.buyDate, reverse=True)
        return out

    async def create(
        self,
        user_id: int,
        ticker: str,
        quantity: float,
        buy_price: float,
        buy_date: datetime | None,
    ) -> FakePosition:
        cls = type(self)

        pos = FakePosition(
            id=cls._next_id,
            userId=user_id,
            ticker=ticker,
            quantity=quantity,
            buyPrice=buy_price,
            buyDate=buy_date or datetime.now(timezone.utc),
        )
        cls._by_id[pos.id] = pos
        cls._next_id += 1
        return pos

    async def close(
        self,
        user_id: int,
        position_id: int,
        sell_price: float,
        sell_date: datetime | None,
    ) -> FakePosition | None:
        cls = type(self)

        pos = cls._by_id.get(position_id)
        if pos is None or pos.userId != user_id or pos.sellDate is not None:
            return None

        pos.sellPrice = sell_price
        pos.sellDate = sell_date or datetime.now(timezone.utc)
        return pos

    async def update(
        self,
        user_id: int,
        position_id: int,
        quantity: float,
        buy_price: float,
        buy_date: datetime | None,
        sell_price: float | None,
        sell_date: datetime | None,
    ) -> FakePosition | None:
        cls = type(self)

        pos = cls._by_id.get(position_id)
        if pos is None or pos.userId != user_id:
            return None

        pos.quantity = quantity
        pos.buyPrice = buy_price
        if buy_date is not None:
            pos.buyDate = buy_date
        if sell_price is not None:
            pos.sellPrice = sell_price
        if sell_date is not None:
            pos.sellDate = sell_date

        return pos

    async def delete(self, user_id: int, position_id: int) -> bool:
        cls = type(self)

        pos = cls._by_id.get(position_id)
        if pos is None or pos.userId != user_id:
            return False

        del cls._by_id[position_id]
        return True

    async def delete_many_for_user(self, user_id: int) -> None:
        cls = type(self)

        for pid, pos in list(cls._by_id.items()):
            if pos.userId == user_id:
                del cls._by_id[pid]

    async def list_open_tickers_grouped_by_user(self) -> dict[int, list[str]]:
        cls = type(self)

        by_user: dict[int, list[str]] = {}
        for p in cls._by_id.values():
            if p.sellDate is None:
                by_user.setdefault(p.userId, []).append(p.ticker)
        return by_user


@pytest.fixture(scope="session")
def async_engine() -> AsyncEngine:
    return create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )


@pytest.fixture()
async def async_session(async_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    SessionLocal = async_sessionmaker(async_engine, expire_on_commit=False, class_=AsyncSession)

    async with SessionLocal() as session:
        yield session


@pytest.fixture()
def settings() -> Settings:
    long_secret = "test-secret-at-least-32-bytes-long-00000000"
    return Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealthwise",
        JWT_SECRET=long_secret,
        FRONTEND_ORIGIN="http://localhost:5173",
        LOG_LEVEL="INFO",
    )


@pytest.fixture()
def emitter() -> FakeEmitter:
    return FakeEmitter()


@pytest.fixture()
def app(settings: Settings, emitter: FakeEmitter) -> FastAPI:
    FakeUsersRepository.reset()
    FakePositionsRepository.reset()

    from app.main import create_app

    app = create_app(settings)
    app.state.emitter = emitter

    async def override_get_session(_: Any = None) -> AsyncGenerator[FakeSession, None]:
        yield FakeSession()

    def override_settings(_: Any = None) -> Settings:
        return settings

    def override_emitter(_: Any = None) -> FakeEmitter:
        return emitter

    def override_user_id() -> int:
        return 1

    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[routes_mod.get_settings] = override_settings
    app.dependency_overrides[routes_mod.get_emitter] = override_emitter
    app.dependency_overrides[routes_mod.get_current_user_id] = override_user_id

    security_mod.hash_password = lambda pw: f"HASH:{pw}"  # type: ignore[assignment]
    security_mod.verify_password = lambda pw, h: h == f"HASH:{pw}"  # type: ignore[assignment]
    routes_mod.hash_password = security_mod.hash_password  # type: ignore[assignment]
    routes_mod.verify_password = security_mod.verify_password  # type: ignore[assignment]

    routes_mod.UsersRepository = FakeUsersRepository  # type: ignore[assignment]
    routes_mod.PositionsRepository = FakePositionsRepository  # type: ignore[assignment]

    return app


@pytest.fixture()
def client(app: FastAPI) -> TestClient:
    return TestClient(app)


@pytest.fixture()
def set_user_id(app: FastAPI) -> Callable[[int], None]:
    def _set(uid: int) -> None:
        app.dependency_overrides[routes_mod.get_current_user_id] = lambda: uid

    return _set
