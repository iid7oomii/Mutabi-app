"""HTTP contract for child goals, including input and access control."""

from datetime import date, timedelta

import pytest
from sqlalchemy import func, select, text

from app.extensions import db
from app.goals.model import Goal

from conftest import CHILD_ID, OTHER_CHILD_ID, USERS


CREATE_URL = "/api/v1/goals/"


def _post(client, headers, payload, actor="doctor"):
    return client.post(CREATE_URL, json=payload, headers=headers(actor))


def _goal_count(app):
    with app.app_context():
        return db.session.scalar(select(func.count()).select_from(Goal))


def test_create_goal_saves_child_not_therapy_plan(app, client, headers, goal_payload):
    response = _post(client, headers, goal_payload)

    assert response.status_code == 201, response.get_json()
    body = response.get_json()
    assert body["child_id"] == CHILD_ID
    assert body["title"] == goal_payload["title"]
    assert body["success_criteria"] == goal_payload["success_criteria"]
    assert body["start_date"] == goal_payload["start_date"]
    assert body["end_date"] == goal_payload["end_date"]
    assert body["reminder_frequency"] == "weekly"
    assert "therapy_plan_id" not in body
    assert _goal_count(app) == 1


def test_create_goal_without_therapy_plan(client, headers, goal_payload):
    response = _post(client, headers, goal_payload)
    assert response.status_code == 201, response.get_json()


def test_create_goal_rejects_nonexistent_child(app, client, headers, goal_payload):
    response = _post(client, headers, {**goal_payload, "child_id": "missing-child"})
    assert response.status_code == 404
    assert _goal_count(app) == 0


@pytest.mark.parametrize("field", ["child_id", "title", "success_criteria", "start_date", "end_date", "reminder_frequency"])
def test_create_goal_rejects_missing_required_field(app, client, headers, goal_payload, field):
    payload = {key: value for key, value in goal_payload.items() if key != field}
    response = _post(client, headers, payload)
    assert response.status_code == 400, response.get_json()
    assert _goal_count(app) == 0


@pytest.mark.parametrize("field", ["title", "success_criteria"])
@pytest.mark.parametrize("value", ["", " \t "])
def test_create_goal_rejects_blank_text(app, client, headers, goal_payload, field, value):
    response = _post(client, headers, {**goal_payload, field: value})
    assert response.status_code == 400
    assert _goal_count(app) == 0


@pytest.mark.parametrize("field,max_length", [("title", 160), ("success_criteria", 300), ("notes", 2000)])
def test_create_goal_accepts_text_at_maximum_length(client, headers, goal_payload, field, max_length):
    response = _post(client, headers, {**goal_payload, field: "x" * max_length})
    assert response.status_code == 201, response.get_json()
    assert response.get_json()[field] == "x" * max_length


@pytest.mark.parametrize("field,max_length", [("title", 160), ("success_criteria", 300), ("notes", 2000)])
def test_create_goal_rejects_text_over_maximum_length(app, client, headers, goal_payload, field, max_length):
    response = _post(client, headers, {**goal_payload, field: "x" * (max_length + 1)})
    assert response.status_code == 400
    assert _goal_count(app) == 0


@pytest.mark.parametrize("field", ["child_id", "title", "success_criteria", "start_date", "end_date", "reminder_frequency"])
@pytest.mark.parametrize("value", [None, 12, True, [], {}])
def test_create_goal_rejects_wrong_required_field_type(app, client, headers, goal_payload, field, value):
    response = _post(client, headers, {**goal_payload, field: value})
    assert response.status_code == 400, response.get_json()
    assert _goal_count(app) == 0


@pytest.mark.parametrize("value", [12, True, [], {}])
def test_create_goal_rejects_wrong_notes_type(app, client, headers, goal_payload, value):
    response = _post(client, headers, {**goal_payload, "notes": value})
    assert response.status_code == 400
    assert _goal_count(app) == 0


@pytest.mark.parametrize("value", ["tomorrow", "2026-02-30", "2026/10/18", "2026-10-18T16:00:00"])
@pytest.mark.parametrize("field", ["start_date", "end_date"])
def test_create_goal_rejects_non_iso_calendar_date(app, client, headers, goal_payload, field, value):
    response = _post(client, headers, {**goal_payload, field: value})
    assert response.status_code == 400
    assert _goal_count(app) == 0


def test_create_goal_accepts_same_start_and_end_date(client, headers, goal_payload):
    response = _post(client, headers, {**goal_payload, "end_date": goal_payload["start_date"]})
    assert response.status_code == 201, response.get_json()


def test_create_goal_rejects_end_date_before_start_date(app, client, headers, goal_payload):
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    response = _post(client, headers, {**goal_payload, "end_date": yesterday})
    assert response.status_code == 400
    assert _goal_count(app) == 0


@pytest.mark.parametrize("value", ["hourly", "Weekly", "", "every_two_days"])
def test_create_goal_rejects_unknown_frequency(app, client, headers, goal_payload, value):
    response = _post(client, headers, {**goal_payload, "reminder_frequency": value})
    assert response.status_code == 400
    assert _goal_count(app) == 0


@pytest.mark.parametrize("value", ["none", "weekly", "twice_weekly", "daily"])
def test_create_goal_accepts_supported_frequency(client, headers, goal_payload, value):
    response = _post(client, headers, {**goal_payload, "reminder_frequency": value})
    assert response.status_code == 201, response.get_json()
    assert response.get_json()["reminder_frequency"] == value


@pytest.mark.parametrize("field,value", [
    ("id", "forged-id"),
    ("status", "completed"),
    ("created_by", "doctor-2"),
    ("clinic_id", "clinic-2"),
    ("parent_id", "parent-2"),
    ("therapy_plan_id", "plan-1"),
    ("target_date", "2030-01-01"),
    ("created_at", "2030-01-01T00:00:00"),
    ("role", "admin"),
    ("unexpected", "value"),
])
def test_create_goal_rejects_unknown_or_server_owned_fields(app, client, headers, goal_payload, field, value):
    response = _post(client, headers, {**goal_payload, field: value})
    assert response.status_code == 400, response.get_json()
    assert _goal_count(app) == 0


@pytest.mark.parametrize("body,content_type", [
    ("", "application/json"),
    ("[]", "application/json"),
    ('{"title":', "application/json"),
    ('"string"', "application/json"),
    ("plain text", "text/plain"),
])
def test_create_goal_rejects_missing_malformed_or_non_object_body(app, client, headers, body, content_type):
    response = client.post(CREATE_URL, data=body, content_type=content_type, headers=headers())
    assert response.status_code == 400
    assert _goal_count(app) == 0


def test_unauthenticated_user_cannot_access_goal_endpoints(client, goal_payload):
    assert client.post(CREATE_URL, json=goal_payload).status_code == 401
    assert client.get(f"/api/v1/goals/child/{CHILD_ID}").status_code == 401


def test_assigned_specialist_can_create_and_list_child_goal(client, headers, create_goal):
    goal = create_goal()
    response = client.get(f"/api/v1/goals/child/{CHILD_ID}", headers=headers())
    assert response.status_code == 200
    assert goal["id"] in {item["id"] for item in response.get_json()}


def test_same_clinic_admin_can_create_child_goal(client, headers, goal_payload):
    response = _post(client, headers, goal_payload, actor="admin")
    assert response.status_code == 201, response.get_json()


def test_other_clinic_admin_cannot_create_or_list_child_goal(client, headers, goal_payload):
    assert _post(client, headers, goal_payload, actor="outside_admin").status_code == 403
    assert client.get(f"/api/v1/goals/child/{CHILD_ID}", headers=headers("outside_admin")).status_code == 403


def test_unassigned_specialist_in_same_clinic_cannot_create_child_goal(client, headers, goal_payload):
    response = _post(client, headers, goal_payload, actor="other_doctor")
    assert response.status_code == 403


def test_parent_cannot_create_child_goal(client, headers, goal_payload):
    response = _post(client, headers, goal_payload, actor="parent")
    assert response.status_code == 403


def test_parent_can_list_own_child_goals(client, headers, create_goal):
    goal = create_goal()
    response = client.get(f"/api/v1/goals/child/{CHILD_ID}", headers=headers("parent"))
    assert response.status_code == 200
    assert goal["id"] in {item["id"] for item in response.get_json()}


def test_parent_cannot_list_another_child_goals(client, headers, create_goal):
    create_goal(child_id=OTHER_CHILD_ID)
    response = client.get(f"/api/v1/goals/child/{OTHER_CHILD_ID}", headers=headers("parent"))
    assert response.status_code == 403


def test_role_claim_in_request_body_does_not_grant_permissions(client, headers, goal_payload):
    response = _post(client, headers, {**goal_payload, "role": "admin"}, actor="parent")
    assert response.status_code == 403


def test_reassignment_moves_goal_access_to_new_specialist(app, client, headers, create_goal):
    goal = create_goal()
    with app.app_context():
        db.session.execute(text("UPDATE children SET doctor_id = 'doctor-2' WHERE id = :id"), {"id": CHILD_ID})
        db.session.commit()
    old_response = client.get(f"/api/v1/goals/child/{CHILD_ID}", headers=headers("doctor"))
    new_response = client.get(f"/api/v1/goals/child/{CHILD_ID}", headers=headers("other_doctor"))
    assert old_response.status_code == 403
    assert new_response.status_code == 200
    assert goal["id"] in {item["id"] for item in new_response.get_json()}


def test_parent_cannot_edit_complete_close_or_delete_goal(client, headers, create_goal):
    goal_id = create_goal()["id"]
    for method, suffix, payload in (
        ("patch", "", {"title": "Changed"}),
        ("post", "/complete", {}),
        ("post", "/close", {}),
        ("delete", "", None),
    ):
        response = getattr(client, method)(
            f"/api/v1/goals/{goal_id}{suffix}", json=payload, headers=headers("parent")
        )
        assert response.status_code == (405 if method == "delete" else 403), (method, suffix, response.get_json())


def test_goal_delete_is_not_available_to_specialist(client, headers, create_goal):
    goal_id = create_goal()["id"]
    response = client.delete(f"/api/v1/goals/{goal_id}", headers=headers())
    assert response.status_code in (404, 405)


@pytest.mark.parametrize("actor", ["other_doctor", "outside_admin", "other_parent"])
def test_user_without_child_access_cannot_mutate_goal_by_id(client, headers, create_goal, actor):
    goal_id = create_goal()["id"]
    for method, suffix, payload in (
        ("patch", "", {"title": "Unauthorized change"}),
        ("post", "/complete", {}),
        ("post", "/close", {}),
    ):
        response = getattr(client, method)(
            f"/api/v1/goals/{goal_id}{suffix}", json=payload, headers=headers(actor)
        )
        assert response.status_code in (403, 404), (actor, method, suffix)


def test_goal_list_is_scoped_to_requested_child(client, headers, create_goal):
    first = create_goal(title="First child")
    second = create_goal(child_id=OTHER_CHILD_ID, title="Second child")
    response = client.get(f"/api/v1/goals/child/{CHILD_ID}", headers=headers("parent"))
    assert response.status_code == 200
    ids = {item["id"] for item in response.get_json()}
    assert first["id"] in ids
    assert second["id"] not in ids


def test_creation_ignores_claimed_admin_role_in_query_string(client, headers, goal_payload):
    response = client.post(
        f"{CREATE_URL}?role=admin&clinic_id=clinic-1",
        json=goal_payload,
        headers=headers("parent"),
    )
    assert response.status_code == 403


@pytest.mark.parametrize("field,max_length", [("title", 160), ("success_criteria", 300)])
def test_create_goal_counts_arabic_characters_at_length_boundary(client, headers, goal_payload, field, max_length):
    accepted = _post(client, headers, {**goal_payload, field: "ه" * max_length})
    rejected = _post(client, headers, {**goal_payload, field: "ه" * (max_length + 1)})
    assert accepted.status_code == 201, accepted.get_json()
    assert rejected.status_code == 400, rejected.get_json()


def test_create_goal_rejects_whitespace_only_child_id(app, client, headers, goal_payload):
    response = _post(client, headers, {**goal_payload, "child_id": " \t "})
    assert response.status_code == 400
    assert _goal_count(app) == 0


def test_create_goal_accepts_null_optional_notes(client, headers, goal_payload):
    response = _post(client, headers, {**goal_payload, "notes": None})
    assert response.status_code == 201, response.get_json()
    assert response.get_json()["notes"] is None
