"""Delivery contract for aggregated goal reminders.

Expected function: app.goals.reminders.dispatch_due_goal_reminders(now_utc, send).
``send`` is called as ``send(parent_id, title, body)`` and returns a bool.
The dispatcher persists enough delivery state to avoid sending twice per parent/day.
"""

from datetime import date, datetime, time, timedelta, timezone
from importlib import import_module
from unittest.mock import Mock

from sqlalchemy import text

from app.extensions import db

from conftest import USERS


NEXT_DAY_16_RIYADH = lambda: datetime.combine(date.today() + timedelta(days=1), time(13), timezone.utc)


def _dispatch(at, send):
    return import_module("app.goals.reminders").dispatch_due_goal_reminders(at, send)


def _daily_goal(create_goal, title="A therapeutic goal", **changes):
    return create_goal(
        title=title,
        reminder_frequency="daily",
        start_date=date.today().isoformat(),
        end_date=(date.today() + timedelta(days=14)).isoformat(),
        **changes,
    )


def _set_parent_time(client, headers, actor="parent", **changes):
    response = client.put(
        "/api/v1/goals/reminder-settings",
        json={"time": "16:00", "timezone": "Asia/Riyadh", "enabled": True, **changes},
        headers=headers(actor),
    )
    assert response.status_code == 200, response.get_json()


def test_dispatch_sends_at_parents_selected_local_time(client, headers, create_goal):
    _daily_goal(create_goal)
    _set_parent_time(client, headers)
    send = Mock(return_value=True)
    _dispatch(NEXT_DAY_16_RIYADH() - timedelta(minutes=1), send)
    send.assert_not_called()
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    send.assert_called_once()
    assert send.call_args.args[0] == USERS["parent"][0]


def test_dispatch_respects_changed_parent_time(client, headers, create_goal):
    _daily_goal(create_goal)
    _set_parent_time(client, headers, time="18:00")
    send = Mock(return_value=True)
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    send.assert_not_called()
    _dispatch(NEXT_DAY_16_RIYADH() + timedelta(hours=2), send)
    send.assert_called_once()


def test_dispatch_uses_parents_local_last_day_when_utc_date_has_advanced(client, headers, create_goal):
    local_last_day = date.today() + timedelta(days=1)
    create_goal(reminder_frequency='daily', start_date=local_last_day.isoformat(), end_date=local_last_day.isoformat())
    _set_parent_time(client, headers, timezone='Pacific/Honolulu')
    send = Mock(return_value=True)
    # 16:00 in Honolulu is 02:00 UTC on the following calendar day.
    at = datetime.combine(local_last_day + timedelta(days=1), time(2), timezone.utc)
    _dispatch(at, send)
    send.assert_called_once()


def test_dispatch_combines_due_goals_for_parent(client, headers, create_goal):
    _daily_goal(create_goal, title="Goal A")
    _daily_goal(create_goal, title="Goal B")
    _set_parent_time(client, headers)
    send = Mock(return_value=True)
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    send.assert_called_once()
    parent_id, title, body = send.call_args.args
    assert parent_id == USERS["parent"][0]
    assert isinstance(title, str) and title
    assert "Goal A" in body and "Goal B" in body


def test_dispatch_does_not_send_twice_to_same_parent_same_day(client, headers, create_goal):
    _daily_goal(create_goal)
    _set_parent_time(client, headers)
    send = Mock(return_value=True)
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    _dispatch(NEXT_DAY_16_RIYADH() + timedelta(minutes=5), send)
    send.assert_called_once()


def test_dispatch_does_not_mark_failed_send_as_delivered(client, headers, create_goal):
    _daily_goal(create_goal)
    _set_parent_time(client, headers)
    send = Mock(side_effect=[False, True])
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    _dispatch(NEXT_DAY_16_RIYADH() + timedelta(minutes=5), send)
    assert send.call_count == 2


def test_dispatch_respects_parent_opt_out(client, headers, create_goal):
    _daily_goal(create_goal)
    _set_parent_time(client, headers, enabled=False)
    send = Mock(return_value=True)
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    send.assert_not_called()


def test_dispatch_ignores_completed_goal(client, headers, create_goal):
    goal = _daily_goal(create_goal)
    _set_parent_time(client, headers)
    response = client.post(f"/api/v1/goals/{goal['id']}/complete", json={}, headers=headers())
    assert response.status_code == 200, response.get_json()
    send = Mock(return_value=True)
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    send.assert_not_called()


def test_dispatch_ignores_closed_goal(client, headers, create_goal):
    goal = _daily_goal(create_goal)
    _set_parent_time(client, headers)
    response = client.post(f"/api/v1/goals/{goal['id']}/close", json={}, headers=headers())
    assert response.status_code == 200, response.get_json()
    send = Mock(return_value=True)
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    send.assert_not_called()


def test_dispatch_ignores_expired_goal_waiting_for_review(app, client, headers, create_goal):
    goal = _daily_goal(create_goal)
    _set_parent_time(client, headers)
    with app.app_context():
        db.session.execute(
            text("UPDATE goals SET end_date = :end_date WHERE id = :id"),
            {"end_date": (date.today() - timedelta(days=1)).isoformat(), "id": goal["id"]},
        )
        db.session.commit()
    send = Mock(return_value=True)
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    send.assert_not_called()


def test_dispatch_never_sends_other_childs_goals_to_parent(client, headers, create_goal):
    _daily_goal(create_goal, title="First child's goal")
    _daily_goal(create_goal, title="Second child's goal", child_id="child-2")
    _set_parent_time(client, headers, "parent")
    _set_parent_time(client, headers, "other_parent")
    send = Mock(return_value=True)
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    assert send.call_count == 2
    messages = {call.args[0]: call.args[2] for call in send.call_args_list}
    assert "First child's goal" in messages[USERS["parent"][0]]
    assert "Second child's goal" not in messages[USERS["parent"][0]]
    assert "Second child's goal" in messages[USERS["other_parent"][0]]
    assert "First child's goal" not in messages[USERS["other_parent"][0]]


def test_dispatch_combines_goals_across_children_of_same_parent(app, client, headers, create_goal):
    with app.app_context():
        db.session.execute(
            text("UPDATE children SET parent_id = :parent_id WHERE id = 'child-2'"),
            {"parent_id": USERS["parent"][0]},
        )
        db.session.commit()
    _daily_goal(create_goal, title="First child goal")
    _daily_goal(create_goal, title="Second child goal", child_id="child-2")
    _set_parent_time(client, headers)
    send = Mock(return_value=True)
    _dispatch(NEXT_DAY_16_RIYADH(), send)
    send.assert_called_once()
    assert send.call_args.args[0] == USERS["parent"][0]
    assert "First child goal" in send.call_args.args[2]
    assert "Second child goal" in send.call_args.args[2]
