from __future__ import annotations

from fastapi.testclient import TestClient

VALID_BUY_DATE = "2026-03-06T00:00:00"
VALID_SELL_DATE = "2026-03-07T00:00:00"


def test_list_open_and_closed(client: TestClient, set_user_id):
    set_user_id(7)

    r1 = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert r1.status_code == 201
    pid = r1.json()["id"]

    r_close = client.put(
        f"/api/positions/{pid}/close",
        json={"sellPrice": 12.0, "sellDate": VALID_SELL_DATE},
    )
    assert r_close.status_code == 200

    r2 = client.post(
        "/api/positions",
        json={
            "ticker": "MSFT",
            "quantity": 2,
            "buyPrice": 5.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert r2.status_code == 201

    r_open = client.get("/api/positions?status=open")
    assert r_open.status_code == 200
    assert len(r_open.json()) == 1

    r_closed = client.get("/api/positions?status=closed")
    assert r_closed.status_code == 200
    assert len(r_closed.json()) == 1


def test_create_position_validation(client: TestClient, set_user_id):
    set_user_id(1)
    r = client.post(
        "/api/positions",
        json={
            "ticker": "   ",
            "quantity": 1,
            "buyPrice": 10,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert r.status_code == 400


def test_create_position_rejects_non_positive_quantity(client: TestClient, set_user_id):
    set_user_id(1)

    zero = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 0,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert zero.status_code == 422

    negative = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": -1,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert negative.status_code == 422


def test_create_position_rejects_missing_buy_price(client: TestClient, set_user_id):
    set_user_id(1)

    r = client.post(
        "/api/positions",
        json={"ticker": "AAPL", "quantity": 1, "buyDate": VALID_BUY_DATE},
    )
    assert r.status_code == 422


def test_create_position_rejects_non_positive_buy_price(client: TestClient, set_user_id):
    set_user_id(1)

    zero = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1,
            "buyPrice": 0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert zero.status_code == 422

    negative = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1,
            "buyPrice": -10,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert negative.status_code == 422


def test_update_position_rejects_non_positive_quantity(client: TestClient, set_user_id):
    set_user_id(1)

    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pid = created.json()["id"]

    zero = client.put(
        f"/api/positions/{pid}",
        json={"quantity": 0, "buyPrice": 11.0, "buyDate": VALID_BUY_DATE},
    )
    assert zero.status_code == 422

    negative = client.put(
        f"/api/positions/{pid}",
        json={"quantity": -2, "buyPrice": 11.0, "buyDate": VALID_BUY_DATE},
    )
    assert negative.status_code == 422


def test_update_position_rejects_missing_buy_price(client: TestClient, set_user_id):
    set_user_id(1)

    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pid = created.json()["id"]

    r = client.put(
        f"/api/positions/{pid}",
        json={"quantity": 2, "buyDate": VALID_BUY_DATE},
    )
    assert r.status_code == 422


def test_update_position_rejects_non_positive_buy_price(client: TestClient, set_user_id):
    set_user_id(1)

    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pid = created.json()["id"]

    zero = client.put(
        f"/api/positions/{pid}",
        json={"quantity": 2, "buyPrice": 0, "buyDate": VALID_BUY_DATE},
    )
    assert zero.status_code == 422

    negative = client.put(
        f"/api/positions/{pid}",
        json={"quantity": 2, "buyPrice": -5, "buyDate": VALID_BUY_DATE},
    )
    assert negative.status_code == 422


def test_create_close_update_delete_happy_path(client: TestClient, set_user_id, emitter):
    set_user_id(1)

    payload = {
        "ticker": "aapl",
        "quantity": 1,
        "buyPrice": 10.0,
        "buyDate": VALID_BUY_DATE,
    }
    r_create = client.post("/api/positions", json=payload)
    assert r_create.status_code == 201
    pid = r_create.json()["id"]

    r_update = client.put(
        f"/api/positions/{pid}",
        json={"quantity": 3, "buyPrice": 11.0, "buyDate": VALID_BUY_DATE},
    )
    assert r_update.status_code == 200

    r_close = client.put(
        f"/api/positions/{pid}/close",
        json={"sellPrice": 20.0, "sellDate": VALID_SELL_DATE},
    )
    assert r_close.status_code == 200

    r_delete = client.delete(f"/api/positions/{pid}")
    assert r_delete.status_code == 204

    evts = [e["event"] for e in emitter.events]
    assert "position:added" in evts
    assert "position:updated" in evts
    assert "position:closed" in evts
    assert "position:deleted" in evts


def test_close_position_rejects_missing_sell_price(client: TestClient, set_user_id):
    set_user_id(1)

    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pid = created.json()["id"]

    r = client.put(
        f"/api/positions/{pid}/close",
        json={"sellDate": VALID_SELL_DATE},
    )
    assert r.status_code == 422


def test_close_position_allows_zero_sell_price(client: TestClient, set_user_id):
    set_user_id(1)

    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pid = created.json()["id"]

    r = client.put(
        f"/api/positions/{pid}/close",
        json={"sellPrice": 0, "sellDate": VALID_SELL_DATE},
    )
    assert r.status_code == 200
    assert r.json()["sellPrice"] == 0.0


def test_close_position_rejects_missing_sell_date(client: TestClient, set_user_id):
    set_user_id(1)

    created = client.post(
        "/api/positions",
        json={
            "ticker": "AAPL",
            "quantity": 1,
            "buyPrice": 10.0,
            "buyDate": VALID_BUY_DATE,
        },
    )
    assert created.status_code == 201
    pid = created.json()["id"]

    r = client.put(
        f"/api/positions/{pid}/close",
        json={"sellPrice": 5.0},
    )
    assert r.status_code == 422


def test_create_position_rejects_missing_buy_date(client: TestClient, set_user_id):
    set_user_id(1)

    r = client.post(
        "/api/positions",
        json={"ticker": "AAPL", "quantity": 1, "buyPrice": 10.0},
    )
    assert r.status_code == 422


def test_close_not_found(client: TestClient, set_user_id):
    set_user_id(1)
    r = client.put(
        "/api/positions/999/close",
        json={"sellPrice": 10.0, "sellDate": VALID_SELL_DATE},
    )
    assert r.status_code == 404


def test_update_not_found(client: TestClient, set_user_id):
    set_user_id(1)
    r = client.put(
        "/api/positions/999",
        json={"quantity": 1, "buyPrice": 1.0, "buyDate": VALID_BUY_DATE},
    )
    assert r.status_code == 404


def test_delete_not_found(client: TestClient, set_user_id):
    set_user_id(1)
    r = client.delete("/api/positions/999")
    assert r.status_code == 404
