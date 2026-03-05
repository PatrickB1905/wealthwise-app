from __future__ import annotations

import time
from collections.abc import Callable
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass(frozen=True)
class CacheKey:
    user_id: int
    name: str
    params: tuple[tuple[str, str], ...]


@dataclass
class CacheEntry(Generic[T]):
    value: T
    expires_at: float


class TTLCache(Generic[T]):
    def __init__(self, ttl_seconds: int) -> None:
        self._ttl = max(1, int(ttl_seconds))
        self._store: dict[CacheKey, CacheEntry[T]] = {}

    def get_or_compute(self, key: CacheKey, fn: Callable[[], T]) -> T:
        now = time.time()
        entry = self._store.get(key)
        if entry and entry.expires_at > now:
            return entry.value

        value = fn()
        self._store[key] = CacheEntry(value=value, expires_at=now + self._ttl)
        return value

    def clear_user(self, user_id: int) -> None:
        for k in list(self._store.keys()):
            if k.user_id == user_id:
                self._store.pop(k, None)
