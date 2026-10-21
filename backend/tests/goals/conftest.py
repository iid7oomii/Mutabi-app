"""Isolated fixtures for the child-goals API contract tests."""

from datetime import date, timedelta

import pytest
from flask_jwt_extended import create_access_token
from sqlalchemy import text

from app import create_app
from app.extensions import db


USERS = {
    "doctor": ("doctor-1", "doctor", "clinic-1"),
    "other_doctor": ("doctor-2", "doctor", "clinic-1"),
    "admin": ("admin-1", "admin", "clinic-1"),
    "parent": ("parent-1", "parent", "clinic-1"),
    "other_parent": ("parent-2", "parent", "clinic-1"),
    "outside_admin": ("admin-2", "admin", "clinic-2"),
}
CHILD_ID = "child-1"
OTHER_CHILD_ID = "child-2"


@pytest.fixture
def app():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "goals-test-secret-at-least-32-bytes-long",
    })
    with app.app_context():
        db.create_all()
        for clinic_id in ("clinic-1", "clinic-2"):
            db.session.execute(
                text("""
                    INSERT INTO clinics (id, name, logo_url, contact_phone)
                    VALUES (:id, :name, '', '0500000000')
                """),
                {"id": clinic_id, "name": clinic_id},
            )
        for user_id, role, clinic_id in USERS.values():
            db.session.execute(
                text("""
                    INSERT INTO users
                        (id, clinic_id, first_name, second_name, email, phone,
                         password, role, is_active)
                    VALUES
                        (:id, :clinic_id, 'Test', 'User', :email, :phone,
                         'unused-test-password', :role, 1)
                """),
                {
                    "id": user_id,
                    "clinic_id": clinic_id,
                    "email": f"{user_id}@example.com",
                    "phone": user_id,
                    "role": role,
                },
            )
        for child_id, parent_id in (
            (CHILD_ID, USERS["parent"][0]),
            (OTHER_CHILD_ID, USERS["other_parent"][0]),
        ):
            db.session.execute(
                text("""
                    INSERT INTO children
                        (id, clinic_id, parent_id, doctor_id, first_name,
                         second_name, date_of_birth)
                    VALUES
                        (:id, 'clinic-1', :parent_id, 'doctor-1',
                         'Test', 'Child', '2020-01-01')
                """),
                {"id": child_id, "parent_id": parent_id},
            )
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def headers(app):
    def make_headers(actor="doctor", **claim_overrides):
        user_id, role, clinic_id = USERS[actor]
        claims = {"role": role, "clinic_id": clinic_id, **claim_overrides}
        with app.app_context():
            token = create_access_token(identity=user_id, additional_claims=claims)
        return {"Authorization": f"Bearer {token}"}

    return make_headers


@pytest.fixture
def goal_payload():
    today = date.today()
    return {
        "child_id": CHILD_ID,
        "title": "Put on shoes independently",
        "success_criteria": "Completes the task without help three times",
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(days=28)).isoformat(),
        "reminder_frequency": "weekly",
    }


@pytest.fixture
def create_goal(client, headers, goal_payload):
    def create(actor="doctor", **changes):
        response = client.post(
            "/api/v1/goals/",
            json={**goal_payload, **changes},
            headers=headers(actor),
        )
        assert response.status_code == 201, response.get_json()
        goal = response.get_json()
        assert isinstance(goal, dict) and goal.get("id")
        return goal

    return create
