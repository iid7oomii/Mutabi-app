import pytest

from app.appointments.service import AppointmentsService
from app.children.repository import ChildrenRepository
from app.users.repository import UserRepositories
from app.appointments.repository import AppointmentsRepository
from datetime import datetime, timedelta


def test_create_appointment_fails_when_child_does_not_exist(monkeypatch):
    monkeypatch.setattr(
        ChildrenRepository,
        "get_by_id",
        lambda child_id: None
    )

    data = {
        "child_id": "child-123",
        "doctor_id": "doctor-123",
        "appointment": (datetime.now() + timedelta(days=30)).replace(hour=16, minute=0, second=0, microsecond=0).isoformat(),
    }

    with pytest.raises(ValueError, match="Child not found"):
        AppointmentsService.create(data)


def test_create_appointment_fails_when_doctor_does_not_exist(monkeypatch):
    monkeypatch.setattr(
        ChildrenRepository,
        "get_by_id",
        lambda child_id: object()
    )

    monkeypatch.setattr(
        UserRepositories,
        "get_by_id",
        lambda doctor_id: None
    )

    data = {
        "child_id": "child-123",
        "doctor_id": "doctor-123",
        "appointment": (datetime.now() + timedelta(days=30)).replace(hour=16, minute=0, second=0, microsecond=0).isoformat(),
    }

    with pytest.raises(ValueError, match="Doctor not found"):
        AppointmentsService.create(data)


def test_create_appointment_success(monkeypatch):
    monkeypatch.setattr(
        ChildrenRepository,
        "get_by_id",
        lambda child_id: object()
    )

    monkeypatch.setattr(
        UserRepositories,
        "get_by_id",
        lambda doctor_id: object()
    )

    monkeypatch.setattr(
    AppointmentsRepository,
    "get_by_doctor_between",
    lambda appointment_date, doctor_id: []
    )

    monkeypatch.setattr(
        AppointmentsRepository,
        "get_by_child_between",
        lambda appointment_date, child_id: []
    )

    class FakeAppointment:
        def to_dict(self):
            return {
                "id": "appointment-1",
                "child_id": "child-123",
                "doctor_id": "doctor-123",
            }

    monkeypatch.setattr(
        AppointmentsRepository,
        "create",
        lambda data: FakeAppointment()
    )

    data = {
        "child_id": "child-123",
        "doctor_id": "doctor-123",
        "appointment": (datetime.now() + timedelta(days=30)).replace(hour=16, minute=0, second=0, microsecond=0).isoformat(),
    }

    result = AppointmentsService.create(data)

    assert result["id"] == "appointment-1"
    assert result["child_id"] == "child-123"
    assert result["doctor_id"] == "doctor-123"


def test_create_appointment_fails_when_date_in_the_past(monkeypatch):
    monkeypatch.setattr(
        UserRepositories,
        "get_by_id",
        lambda doctor_id: object()
    )

    monkeypatch.setattr(
        ChildrenRepository,
        "get_by_id",
        lambda child_id: object()
    )

    class FakeAppointment:
        def to_dict(self):
            return {}

    monkeypatch.setattr(
        AppointmentsRepository,
        "create",
        lambda data: FakeAppointment()
    )

    data = {
        "child_id": "child-123",
        "doctor_id": "doctor-123",
        "appointment": "2025-08-20T16:00:00"
    }

    with pytest.raises(ValueError, match="Start date must be in the future"):
        AppointmentsService.create(data)


def test_has_conflict_when_buffer_less_than_10_minutes():
    old_start = datetime(2026, 8, 20, 16, 0)
    new_start = datetime(2026, 8, 20, 16, 35)

    result = AppointmentsService.has_conflict(old_start, new_start)

    assert result is True


def test_has_no_conflict_when_buffer_is_exactly_10_minutes():
    old_start = datetime(2026, 8, 20, 16, 0)
    new_start = datetime(2026, 8, 20, 16, 40)

    result = AppointmentsService.has_conflict(old_start, new_start)

    assert result is False

def test_has_conflict_when_buffer_is_9_minutes_59_seconds():
    old_start = datetime(2026, 8, 20, 16, 0)
    new_start = datetime(2026, 8, 20, 16, 39,59)

    result = AppointmentsService.has_conflict(old_start, new_start)

    assert result is True


def test_has_conflict_when_new_appointment_is_before_old_with_5_minute_buffer():
    old_start = datetime(2026, 8, 20, 16, 35)
    new_start = datetime(2026, 8, 20, 16, 0)

    result = AppointmentsService.has_conflict(old_start, new_start)

    assert result is True


def test_has_conflict_when_buffer_is_9_minutes_59_seconds():
    old_start = datetime(2026, 8, 20, 16, 39,59)
    new_start = datetime(2026, 8, 20, 16, 0)

    result = AppointmentsService.has_conflict(old_start, new_start)

    assert result is True

def test_has_no_conflict_when_buffer_is_exactly_10_minutes():
    old_start = datetime(2026, 8, 20, 16, 40)
    new_start = datetime(2026, 8, 20, 16, 0)

    result = AppointmentsService.has_conflict(old_start, new_start)

    assert result is False


def test_create_appointment_fails_when_doctor_has_conflict(monkeypatch):
    monkeypatch.setattr(
        UserRepositories,
        "get_by_id",
        lambda doctor_id: object()
    )

    monkeypatch.setattr(
        ChildrenRepository,
        "get_by_id",
        lambda child_id: object()
    )

    class FakeExistingAppointment:
        appointment = (datetime.now() + timedelta(days=30)).replace(hour=16, minute=0, second=0, microsecond=0)

    monkeypatch.setattr(
        AppointmentsRepository,
        "get_by_doctor_between",
        lambda doctor_appointment, doctor_id: [FakeExistingAppointment()]
    )

    monkeypatch.setattr(
        AppointmentsRepository,
        "get_by_child_between",
        lambda child_appointment, child_id: []
    )

    data = {
        "child_id": "child-123",
        "doctor_id": "doctor-123",
        "appointment": (datetime.now() + timedelta(days=30)).replace(hour=16, minute=30, second=0, microsecond=0).isoformat()
    }

    with pytest.raises(ValueError, match="Doctor has a conflicting appointment"):
        AppointmentsService.create(data)
