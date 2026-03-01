from __future__ import annotations

import pytest

from app.services.realtime import NullEmitter, SocketEmitter


class FakeSio:
    def __init__(self) -> None:
        self.calls: list[tuple[str, object, str]] = []

    async def emit(self, event: str, data: object, room: str) -> None:
        self.calls.append((event, data, room))


@pytest.mark.asyncio
async def test_socket_emitter_emit_and_emit_to_sid() -> None:
    sio = FakeSio()
    emitter = SocketEmitter(sio=sio)  # type: ignore[arg-type]

    await emitter.emit(room="user_1", event="price:update", data={"x": 1})
    await emitter.emit_to_sid(sid="SID123", event="price:snapshot", data=[{"y": 2}])

    assert sio.calls == [
        ("price:update", {"x": 1}, "user_1"),
        ("price:snapshot", [{"y": 2}], "SID123"),
    ]


@pytest.mark.asyncio
async def test_null_emitter_is_noop() -> None:
    emitter = NullEmitter()
    await emitter.emit(room="user_1", event="evt", data={"a": 1})
    await emitter.emit_to_sid(sid="SID", event="evt", data={"a": 1})
