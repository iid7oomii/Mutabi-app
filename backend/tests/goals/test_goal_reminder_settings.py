"""Parent reminder settings and request validation."""

import pytest


SETTINGS_URL = "/api/v1/goals/reminder-settings"


def test_parent_gets_default_four_pm_local_reminder_settings(client, headers):
    response = client.get(SETTINGS_URL, headers=headers("parent"))
    assert response.status_code == 200, response.get_json()
    assert response.get_json()["time"] == "16:00"
    assert response.get_json()["enabled"] is True


def test_parent_can_choose_reminder_time_and_timezone(client, headers):
    update = {"time": "18:30", "timezone": "Asia/Riyadh", "enabled": True}
    response = client.put(SETTINGS_URL, json=update, headers=headers("parent"))
    assert response.status_code == 200, response.get_json()
    saved = client.get(SETTINGS_URL, headers=headers("parent"))
    assert saved.status_code == 200
    assert saved.get_json()["time"] == "18:30"
    assert saved.get_json()["timezone"] == "Asia/Riyadh"


def test_parent_can_turn_off_goal_reminders(client, headers):
    response = client.put(SETTINGS_URL, json={"enabled": False}, headers=headers("parent"))
    assert response.status_code == 200, response.get_json()
    assert client.get(SETTINGS_URL, headers=headers("parent")).get_json()["enabled"] is False


def test_reminder_settings_are_independent_for_each_parent(client, headers):
    first = client.put(SETTINGS_URL, json={"time": "09:00"}, headers=headers("parent"))
    assert first.status_code == 200, first.get_json()
    second = client.get(SETTINGS_URL, headers=headers("other_parent"))
    assert second.status_code == 200, second.get_json()
    assert second.get_json()["time"] == "16:00"


@pytest.mark.parametrize("field,value", [
    ("time", "4pm"),
    ("time", "24:00"),
    ("time", "16:60"),
    ("time", "16:00:00"),
    ("time", "x" * 100),
    ("time", 1600),
    ("time", []),
    ("enabled", "false"),
    ("enabled", 0),
    ("enabled", None),
    ("timezone", "Invalid/Zone"),
    ("timezone", "x" * 256),
    ("timezone", 12),
])
def test_reminder_settings_reject_invalid_types_formats_and_lengths(client, headers, field, value):
    response = client.put(SETTINGS_URL, json={field: value}, headers=headers("parent"))
    assert response.status_code == 400, response.get_json()


@pytest.mark.parametrize("field,value", [
    ("user_id", "parent-2"),
    ("child_id", "child-2"),
    ("role", "admin"),
    ("created_at", "2030-01-01T00:00:00"),
    ("unexpected", True),
])
def test_reminder_settings_reject_unknown_and_server_owned_fields(client, headers, field, value):
    response = client.put(SETTINGS_URL, json={field: value}, headers=headers("parent"))
    assert response.status_code == 400, response.get_json()


def test_parent_cannot_update_another_parents_settings_by_id(client, headers):
    response = client.put(
        SETTINGS_URL,
        json={"user_id": "parent-2", "time": "09:00"},
        headers=headers("parent"),
    )
    assert response.status_code == 400
    own = client.get(SETTINGS_URL, headers=headers("other_parent"))
    assert own.status_code == 200
    assert own.get_json()["time"] == "16:00"


def test_doctor_cannot_change_parent_reminder_settings(client, headers):
    response = client.put(SETTINGS_URL, json={"time": "09:00"}, headers=headers("doctor"))
    assert response.status_code == 403
