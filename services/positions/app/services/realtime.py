from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

import socketio


class Emitter(Protocol):
    async def emit(self, room: str, event: str, data: Any) -> None: ...


@dataclass(frozen=True)
class SocketEmitter:
    sio: socketio.AsyncServer

    async def emit(self, room: str, event: str, data: Any) -> None:
        await self.sio.emit(event, data, room=room)


@dataclass(frozen=True)
class NullEmitter:
    async def emit(self, room: str, event: str, data: Any) -> None:
        return
