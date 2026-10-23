from app.appointments.repository import AppointmentsRepository
from app.children.repository import ChildrenRepository
from app.users.repository import UserRepositories
from datetime import datetime, timedelta


class AppointmentsService:

    @staticmethod
    def create(data: dict) -> dict:
        if not ChildrenRepository.get_by_id(data["child_id"]):
            raise ValueError("Child not found")
        if not UserRepositories.get_by_id(data["doctor_id"]):
            raise ValueError("Doctor not found")

        appointment_time = datetime.fromisoformat(data["appointment"])

        if appointment_time <= datetime.now():
            raise ValueError("Start date must be in the future")
        

        doctor_appointments = AppointmentsRepository.get_by_doctor_between(
            appointment_time,
            data["doctor_id"]
        )

        child_appointments = AppointmentsRepository.get_by_child_between(
            appointment_time,
            data["child_id"]
        )

        for appointment in doctor_appointments:
            if AppointmentsService.has_conflict(
                appointment.appointment,
                appointment_time
            ):
                raise ValueError("Doctor has a conflicting appointment")

        for appointment in child_appointments:
            if AppointmentsService.has_conflict(
                appointment.appointment,
                appointment_time
            ):
                raise ValueError("Child has a conflicting appointment")

        appointment = AppointmentsRepository.create({
            "child_id": data["child_id"],
            "doctor_id": data["doctor_id"],
            "appointment": data["appointment"],
            "notes": data.get("notes"),
        })
        return appointment.to_dict()

    @staticmethod
    def get_by_child(child_id: str) -> list:
        if not ChildrenRepository.get_by_id(child_id):
            raise ValueError("Child not found")
        return [a.to_dict() for a in AppointmentsRepository.get_by_child(child_id)]

    @staticmethod
    def get_upcoming_by_child(child_id: str) -> dict:
        appointment = AppointmentsRepository.get_upcoming_by_child(child_id)
        if not appointment:
            raise ValueError("No upcoming appointments found")
        return appointment.to_dict()

    @staticmethod
    def get_by_id(appointment_id: str) -> dict:
        appointment = AppointmentsRepository.get_by_id(appointment_id)
        if not appointment:
            raise ValueError("Appointment not found")
        return appointment.to_dict()

    @staticmethod
    def get_by_doctor(doctor_id: str) -> list:
        return [a.to_dict() for a in AppointmentsRepository.get_by_doctor(doctor_id)]

    @staticmethod
    def update(appointment_id: str, data: dict) -> dict:
        appointment = AppointmentsRepository.update(appointment_id, data)
        if not appointment:
            raise ValueError("Appointment not found")
        return appointment.to_dict()

    @staticmethod
    def delete(appointment_id: str) -> dict:
        deleted = AppointmentsRepository.delete(appointment_id)
        if not deleted:
            raise ValueError("Appointment not found")
        return {"message": "Appointment deleted successfully"}


    @staticmethod
    def has_conflict(old_start: datetime, new_start: datetime) -> bool:
        old_end = old_start + timedelta(minutes=30)
        new_end = new_start + timedelta(minutes=30)

        no_conflict = (
            new_start >= old_end + timedelta(minutes=10)
            or
            new_end + timedelta(minutes=10) <= old_start
        )

        return not no_conflict