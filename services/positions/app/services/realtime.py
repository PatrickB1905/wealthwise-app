from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

import socketio


class Emitter(Protocol):
    async def emit(self, room: str, event: str, data: Any) -> None: ...
    async def emit_to_sid(self, sid: str, event: str, data: Any) -> None: ...


@dataclass(frozen=True)
class SocketEmitter:
    sio: socketio.AsyncServer

    async def emit(self, room: str, event: str, data: Any) -> None:
        await self.sio.emit(event, data, room=room)

    async def emit_to_sid(self, sid: str, event: str, data: Any) -> None:
        await self.sio.emit(event, data, room=sid)


@dataclass(frozen=True)
class NullEmitter:
    async def emit(self, room: str, event: str, data: Any) -> None:
        return

    async def emit_to_sid(self, sid: str, event: str, data: Any) -> None:
        return
