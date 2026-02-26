from __future__ import annotations

from fastapi.testclient import TestClient


def test_list_open_and_closed(client: TestClient, set_user_id):
    set_user_id(7)

    r1 = client.post("/api/positions", json={"ticker": "AAPL", "quantity": 1, "buyPrice": 10.0})
    assert r1.status_code == 201
    pid = r1.json()["id"]

    r_close = client.put(f"/api/positions/{pid}/close", json={"sellPrice": 12.0})
    assert r_close.status_code == 200

    r2 = client.post("/api/positions", json={"ticker": "MSFT", "quantity": 2, "buyPrice": 5.0})
    assert r2.status_code == 201

    r_open = client.get("/api/positions?status=open")
    assert r_open.status_code == 200
    assert len(r_open.json()) == 1

    r_closed = client.get("/api/positions?status=closed")
    assert r_closed.status_code == 200
    assert len(r_closed.json()) == 1


def test_create_position_validation(client: TestClient, set_user_id):
    set_user_id(1)
    r = client.post("/api/positions", json={"ticker": "   ", "quantity": 1, "buyPrice": 10})
    assert r.status_code == 400


def test_create_close_update_delete_happy_path(client: TestClient, set_user_id, emitter):
    set_user_id(1)

    payload = {"ticker": "aapl", "quantity": 1, "buyPrice": 10.0}
    r_create = client.post("/api/positions", json=payload)
    assert r_create.status_code == 201
    pid = r_create.json()["id"]

    r_update = client.put(f"/api/positions/{pid}", json={"quantity": 3, "buyPrice": 11.0})
    assert r_update.status_code == 200

    r_close = client.put(f"/api/positions/{pid}/close", json={"sellPrice": 20.0})
    assert r_close.status_code == 200

    r_delete = client.delete(f"/api/positions/{pid}")
    assert r_delete.status_code == 204

    evts = [e["event"] for e in emitter.events]
    assert "position:added" in evts
    assert "position:updated" in evts
    assert "position:closed" in evts
    assert "position:deleted" in evts


def test_close_not_found(client: TestClient, set_user_id):
    set_user_id(1)
    r = client.put("/api/positions/999/close", json={"sellPrice": 10.0})
    assert r.status_code == 404


def test_update_not_found(client: TestClient, set_user_id):
    set_user_id(1)
    r = client.put("/api/positions/999", json={"quantity": 1, "buyPrice": 1.0})
    assert r.status_code == 404


def test_delete_not_found(client: TestClient, set_user_id):
    set_user_id(1)
    r = client.delete("/api/positions/999")
    assert r.status_code == 404
