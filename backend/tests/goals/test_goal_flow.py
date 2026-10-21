"""One end-to-end backend flow across specialist, parent, and reminders."""

from datetime import date, datetime, time, timedelta, timezone
from importlib import import_module
from unittest.mock import Mock

from conftest import CHILD_ID


def test_create_view_complete_goal_flow_stops_future_reminders(client, headers, create_goal):
    goal = create_goal(reminder_frequency="daily")
    goal_id = goal["id"]

    parent_view = client.get(f"/api/v1/goals/child/{CHILD_ID}", headers=headers("parent"))
    assert parent_view.status_code == 200
    assert next(item for item in parent_view.get_json() if item["id"] == goal_id)["status"] == "active"

    completion = client.post(f"/api/v1/goals/{goal_id}/complete", json={}, headers=headers("doctor"))
    assert completion.status_code == 200, completion.get_json()

    updated_view = client.get(f"/api/v1/goals/child/{CHILD_ID}", headers=headers("parent"))
    assert updated_view.status_code == 200
    assert next(item for item in updated_view.get_json() if item["id"] == goal_id)["status"] == "completed"

    setting = client.put(
        "/api/v1/goals/reminder-settings",
        json={"time": "16:00", "timezone": "Asia/Riyadh", "enabled": True},
        headers=headers("parent"),
    )
    assert setting.status_code == 200, setting.get_json()
    send = Mock(return_value=True)
    at = datetime.combine(date.today() + timedelta(days=1), time(13), timezone.utc)
    import_module("app.goals.reminders").dispatch_due_goal_reminders(at, send)
    send.assert_not_called()
