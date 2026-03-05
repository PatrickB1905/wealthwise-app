from __future__ import annotations

from fastapi.testclient import TestClient


def test_me_returns_404_when_user_missing(client: TestClient, set_user_id) -> None:
    set_user_id(999)
    r = client.get("/api/auth/me")
    assert r.status_code == 404


def test_update_email_requires_email(client: TestClient) -> None:
    r = client.put("/api/auth/me/email", json={"email": "   "})
    assert r.status_code == 400


def test_update_password_rejects_wrong_current_password(client: TestClient) -> None:
    reg = client.post(
        "/api/auth/register",
        json={"firstName": "A", "lastName": "B", "email": "pw@x.com", "password": "pw"},
    )
    assert reg.status_code == 201

    r = client.put(
        "/api/auth/me/password",
        json={"currentPassword": "wrong", "newPassword": "newpw"},
    )
    assert r.status_code == 400
    assert "incorrect" in r.json()["detail"].lower()


def test_delete_me_returns_204(client: TestClient) -> None:
    reg = client.post(
        "/api/auth/register",
        json={"firstName": "A", "lastName": "B", "email": "del@x.com", "password": "pw"},
    )
    assert reg.status_code == 201

    r = client.delete("/api/auth/me")
    assert r.status_code == 204
