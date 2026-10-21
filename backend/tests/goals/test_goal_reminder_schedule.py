"""Pure scheduling contract for goal reminders.

Expected function: app.goals.reminders.is_due_on_date(
    created_on, start_on, end_on, frequency, status, on_date
) -> bool. All date arguments are ``datetime.date`` values.
"""

from datetime import date, timedelta
from importlib import import_module

import pytest


CREATED = date(2026, 1, 1)
END = date(2026, 2, 1)


def _due(on_date, frequency="weekly", start_on=CREATED, end_on=END, status="active"):
    reminders = import_module("app.goals.reminders")
    return reminders.is_due_on_date(CREATED, start_on, end_on, frequency, status, on_date)


@pytest.mark.parametrize("days,expected", [(0, True), (1, True), (7, True), (30, True)])
def test_daily_reminder_is_due_each_day_in_goal_duration(days, expected):
    assert _due(CREATED + timedelta(days=days), "daily") is expected


@pytest.mark.parametrize("days,expected", [(0, True), (1, False), (6, False), (7, True), (8, False), (14, True)])
def test_weekly_reminder_uses_creation_date_and_seven_day_gaps(days, expected):
    assert _due(CREATED + timedelta(days=days)) is expected


@pytest.mark.parametrize("days,expected", [(0, True), (1, False), (2, False), (3, True), (4, False), (6, False), (7, True), (10, True), (14, True)])
def test_twice_weekly_reminder_alternates_three_and_four_day_gaps(days, expected):
    assert _due(CREATED + timedelta(days=days), "twice_weekly") is expected


def test_no_reminder_frequency_never_becomes_due():
    assert all(not _due(CREATED + timedelta(days=i), "none") for i in range(15))


def test_reminder_is_not_due_before_goal_start_even_when_creation_anchor_matches():
    assert _due(CREATED + timedelta(days=7), start_on=CREATED + timedelta(days=8)) is False
    assert _due(CREATED + timedelta(days=14), start_on=CREATED + timedelta(days=8)) is True


def test_reminder_is_not_due_before_creation_or_after_goal_end():
    assert _due(CREATED - timedelta(days=1)) is False
    assert _due(END + timedelta(days=1), "daily") is False


@pytest.mark.parametrize("status", ["completed", "closed", "awaiting_review"])
def test_reminder_is_not_due_for_inactive_goal(status):
    assert _due(CREATED + timedelta(days=7), status=status) is False


def test_missed_weekly_reminder_is_not_replayed_on_following_day():
    assert _due(CREATED + timedelta(days=8)) is False
