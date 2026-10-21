"""Goal updates and state transitions through the HTTP API."""

from datetime import date, timedelta

import pytest
from sqlalchemy import text

from app.extensions import db

from conftest import CHILD_ID


def _item(client, headers, goal_id, actor="doctor"):
    response = client.get(f"/api/v1/goals/child/{CHILD_ID}", headers=headers(actor))
    assert response.status_code == 200, response.get_json()
    return next(goal for goal in response.get_json() if goal["id"] == goal_id)


def _set_end_date(app, goal_id, end_date):
    with app.app_context():
        db.session.execute(
            text("UPDATE goals SET end_date = :end_date WHERE id = :id"),
            {"end_date": end_date.isoformat(), "id": goal_id},
        )
        db.session.commit()


def test_specialist_can_edit_goal_fields(client, headers, create_goal):
    goal_id = create_goal()["id"]
    new_end = (date.today() + timedelta(days=45)).isoformat()
    response = client.patch(
        f"/api/v1/goals/{goal_id}",
        json={
            "title": "Updated title",
            "success_criteria": "Updated success criterion",
            "notes": "Updated notes",
            "end_date": new_end,
            "reminder_frequency": "daily",
        },
        headers=headers(),
    )
    assert response.status_code == 200, response.get_json()
    stored = _item(client, headers, goal_id)
    assert stored["title"] == "Updated title"
    assert stored["success_criteria"] == "Updated success criterion"
    assert stored["notes"] == "Updated notes"
    assert stored["end_date"] == new_end
    assert stored["reminder_frequency"] == "daily"


@pytest.mark.parametrize("field,value", [
    ("title", ""),
    ("title", "x" * 161),
    ("title", 12),
    ("success_criteria", "  "),
    ("success_criteria", "x" * 301),
    ("success_criteria", []),
    ("notes", "x" * 2001),
    ("notes", {}),
    ("start_date", True),
    ("end_date", ["2030-01-01"]),
    ("reminder_frequency", "hourly"),
    ("reminder_frequency", 2),
])
def test_edit_goal_rejects_invalid_value_without_changing_record(client, headers, create_goal, field, value):
    goal = create_goal()
    response = client.patch(f"/api/v1/goals/{goal['id']}", json={field: value}, headers=headers())
    assert response.status_code == 400, response.get_json()
    assert _item(client, headers, goal["id"])[field] == goal.get(field)


def test_edit_goal_rejects_end_date_before_start_date(client, headers, create_goal):
    goal = create_goal()
    response = client.patch(
        f"/api/v1/goals/{goal['id']}",
        json={"end_date": (date.today() - timedelta(days=1)).isoformat()},
        headers=headers(),
    )
    assert response.status_code == 400
    assert _item(client, headers, goal["id"])["end_date"] == goal["end_date"]


@pytest.mark.parametrize("field,value", [
    ("id", "forged-id"),
    ("child_id", "child-2"),
    ("created_by", "doctor-2"),
    ("status", "completed"),
    ("clinic_id", "clinic-2"),
    ("created_at", "2030-01-01T00:00:00"),
    ("unexpected", "value"),
])
def test_edit_goal_rejects_unknown_or_server_owned_field(client, headers, create_goal, field, value):
    goal = create_goal()
    response = client.patch(f"/api/v1/goals/{goal['id']}", json={field: value}, headers=headers())
    assert response.status_code == 400, response.get_json()
    assert _item(client, headers, goal["id"])["child_id"] == goal["child_id"]


def test_goal_is_active_through_its_end_date(client, headers, create_goal):
    goal = create_goal(end_date=date.today().isoformat())
    assert _item(client, headers, goal["id"])["status"] == "active"


def test_goal_awaits_review_day_after_end_date(app, client, headers, create_goal):
    goal = create_goal()
    _set_end_date(app, goal["id"], date.today() - timedelta(days=1))
    assert _item(client, headers, goal["id"])["status"] == "awaiting_review"


def test_specialist_can_complete_goal_before_end_date(client, headers, create_goal):
    goal = create_goal()
    response = client.post(f"/api/v1/goals/{goal['id']}/complete", json={}, headers=headers())
    assert response.status_code == 200, response.get_json()
    assert _item(client, headers, goal["id"])["status"] == "completed"


def test_specialist_can_confirm_achievement_during_expired_review(app, client, headers, create_goal):
    goal = create_goal()
    _set_end_date(app, goal["id"], date.today() - timedelta(days=1))
    response = client.post(f"/api/v1/goals/{goal['id']}/complete", json={}, headers=headers())
    assert response.status_code == 200, response.get_json()
    assert _item(client, headers, goal["id"])["status"] == "completed"


def test_specialist_can_extend_expired_goal(app, client, headers, create_goal):
    goal = create_goal()
    _set_end_date(app, goal["id"], date.today() - timedelta(days=1))
    new_end = (date.today() + timedelta(days=14)).isoformat()
    response = client.patch(f"/api/v1/goals/{goal['id']}", json={"end_date": new_end}, headers=headers())
    assert response.status_code == 200, response.get_json()
    stored = _item(client, headers, goal["id"])
    assert stored["end_date"] == new_end
    assert stored["status"] == "active"


def test_specialist_can_close_goal_without_achievement(client, headers, create_goal):
    goal = create_goal()
    response = client.post(f"/api/v1/goals/{goal['id']}/close", json={}, headers=headers())
    assert response.status_code == 200, response.get_json()
    stored = _item(client, headers, goal["id"])
    assert stored["status"] == "closed"
    assert stored["id"] == goal["id"]


def test_completed_goal_stays_completed_after_end_date(app, client, headers, create_goal):
    goal = create_goal()
    response = client.post(f"/api/v1/goals/{goal['id']}/complete", json={}, headers=headers())
    assert response.status_code == 200, response.get_json()
    _set_end_date(app, goal["id"], date.today() - timedelta(days=1))
    assert _item(client, headers, goal["id"])["status"] == "completed"


def test_admin_can_complete_goal(client, headers, create_goal):
    goal = create_goal()
    response = client.post(f"/api/v1/goals/{goal['id']}/complete", json={}, headers=headers("admin"))
    assert response.status_code == 200, response.get_json()


def test_unassigned_specialist_cannot_complete_goal(client, headers, create_goal):
    goal = create_goal()
    response = client.post(f"/api/v1/goals/{goal['id']}/complete", json={}, headers=headers("other_doctor"))
    assert response.status_code == 403


def test_parent_cannot_complete_goal(client, headers, create_goal):
    goal = create_goal()
    response = client.post(f"/api/v1/goals/{goal['id']}/complete", json={}, headers=headers("parent"))
    assert response.status_code == 403


def test_goal_remains_after_therapy_plan_change(app, client, headers, create_goal):
    goal = create_goal()
    with app.app_context():
        db.session.execute(
            text("INSERT INTO therapy_plans (id, child_id, title) VALUES ('plan-1', :child_id, 'Old plan')"),
            {"child_id": CHILD_ID},
        )
        db.session.execute(text("DELETE FROM therapy_plans WHERE id = 'plan-1'"))
        db.session.execute(
            text("INSERT INTO therapy_plans (id, child_id, title) VALUES ('plan-2', :child_id, 'New plan')"),
            {"child_id": CHILD_ID},
        )
        db.session.commit()
    response = client.get(f"/api/v1/goals/child/{CHILD_ID}", headers=headers("parent"))
    assert response.status_code == 200
    assert goal["id"] in {item["id"] for item in response.get_json()}


def test_completing_daily_exercise_does_not_complete_goal(app, client, headers, create_goal):
    goal = create_goal()
    with app.app_context():
        db.session.execute(
            text("INSERT INTO therapy_plans (id, child_id, title) VALUES ('plan-1', :child_id, 'Home plan')"),
            {"child_id": CHILD_ID},
        )
        db.session.execute(
            text("INSERT INTO exercises (id, clinic_id, title, description) VALUES ('exercise-1', 'clinic-1', 'Shoe practice', 'Practice at home')")
        )
        db.session.execute(
            text("INSERT INTO plan_exercises (id, therapy_plan_id, exercise_id) VALUES ('plan-exercise-1', 'plan-1', 'exercise-1')")
        )
        db.session.commit()
    response = client.post(
        "/api/v1/feedback/",
        json={
            "plan_exercise_id": "plan-exercise-1",
            "feedback_date": date.today().isoformat(),
            "completion_status": "completed",
            "pain_level": 0,
        },
        headers=headers("parent"),
    )
    assert response.status_code == 201, response.get_json()
    assert _item(client, headers, goal["id"])["status"] == "active"


@pytest.mark.parametrize("suffix", ["/complete", "/close"])
@pytest.mark.parametrize("payload", [
    {"status": "completed"},
    {"child_id": "child-2"},
    {"created_by": "doctor-2"},
    {"role": "admin"},
])
def test_goal_state_action_rejects_client_controlled_fields(client, headers, create_goal, suffix, payload):
    goal = create_goal()
    response = client.post(f"/api/v1/goals/{goal['id']}{suffix}", json=payload, headers=headers())
    assert response.status_code == 400, response.get_json()
    assert _item(client, headers, goal["id"])["status"] == "active"


def test_edit_goal_rejects_entire_request_when_one_field_is_invalid(client, headers, create_goal):
    goal = create_goal()
    response = client.patch(
        f"/api/v1/goals/{goal['id']}",
        json={"title": "Valid replacement", "success_criteria": "x" * 301},
        headers=headers(),
    )
    assert response.status_code == 400, response.get_json()
    assert _item(client, headers, goal["id"])["title"] == goal["title"]


@pytest.mark.parametrize("body,content_type", [
    ("[]", "application/json"),
    ('{"title":', "application/json"),
    ("plain text", "text/plain"),
])
def test_edit_goal_rejects_non_object_or_malformed_request(client, headers, create_goal, body, content_type):
    goal = create_goal()
    response = client.patch(
        f"/api/v1/goals/{goal['id']}",
        data=body,
        content_type=content_type,
        headers=headers(),
    )
    assert response.status_code == 400, response.get_json()
