from __future__ import annotations

from fastapi.testclient import TestClient


def test_register_validation(client: TestClient):
    r = client.post(
        "/api/auth/register",
        json={"firstName": "", "lastName": "", "email": "", "password": ""},
    )
    assert r.status_code == 400


def test_register_success_and_duplicate(client: TestClient):
    r1 = client.post(
        "/api/auth/register",
        json={
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "password": "pw",
        },
    )
    assert r1.status_code == 201
    assert "token" in r1.json()

    r2 = client.post(
        "/api/auth/register",
        json={
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "password": "pw",
        },
    )
    assert r2.status_code == 409


def test_login_validation(client: TestClient):
    r = client.post("/api/auth/login", json={"email": "", "password": ""})
    assert r.status_code == 400


def test_login_invalid_credentials(client: TestClient):
    r = client.post("/api/auth/login", json={"email": "x@example.com", "password": "pw"})
    assert r.status_code == 401


def test_login_success(client: TestClient):
    client.post(
        "/api/auth/register",
        json={"firstName": "A", "lastName": "B", "email": "a@b.com", "password": "pw"},
    )
    r = client.post("/api/auth/login", json={"email": "a@b.com", "password": "pw"})
    assert r.status_code == 200
    assert "token" in r.json()


def test_me_user_not_found(client: TestClient, set_user_id):
    set_user_id(999)
    r = client.get("/api/auth/me")
    assert r.status_code == 404


def test_me_success(client: TestClient, set_user_id):
    client.post(
        "/api/auth/register",
        json={"firstName": "A", "lastName": "B", "email": "me@b.com", "password": "pw"},
    )
    set_user_id(1)
    r = client.get("/api/auth/me")
    assert r.status_code == 200
    assert r.json()["email"] == "me@b.com"


def test_update_email_validation(client: TestClient, set_user_id):
    client.post(
        "/api/auth/register",
        json={
            "firstName": "A",
            "lastName": "B",
            "email": "old@b.com",
            "password": "pw",
        },
    )
    set_user_id(1)
    r = client.put("/api/auth/me/email", json={"email": ""})
    assert r.status_code == 400


def test_update_email_conflict(client: TestClient, set_user_id):
    client.post(
        "/api/auth/register",
        json={
            "firstName": "A",
            "lastName": "B",
            "email": "one@b.com",
            "password": "pw",
        },
    )
    client.post(
        "/api/auth/register",
        json={
            "firstName": "C",
            "lastName": "D",
            "email": "two@b.com",
            "password": "pw",
        },
    )

    set_user_id(2)
    r = client.put("/api/auth/me/email", json={"email": "one@b.com"})
    assert r.status_code == 409


def test_update_password_wrong_current(client: TestClient, set_user_id):
    client.post(
        "/api/auth/register",
        json={"firstName": "A", "lastName": "B", "email": "pw@b.com", "password": "pw"},
    )
    set_user_id(1)
    r = client.put(
        "/api/auth/me/password",
        json={"currentPassword": "nope", "newPassword": "new"},
    )
    assert r.status_code == 400


def test_delete_me(client: TestClient, set_user_id):
    client.post(
        "/api/auth/register",
        json={
            "firstName": "A",
            "lastName": "B",
            "email": "del@b.com",
            "password": "pw",
        },
    )
    set_user_id(1)
    r = client.delete("/api/auth/me")
    assert r.status_code == 204
