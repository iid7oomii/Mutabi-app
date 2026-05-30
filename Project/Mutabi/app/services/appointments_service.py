from app.repositories.appointments_repository import AppointmentsRepository
from app.repositories.children_repository import ChildrenRepository
from app.repositories.user_repsitories import UserRepositories


class AppointmentsService:

    @staticmethod
    def create(data: dict) -> dict:
        if not ChildrenRepository.get_by_id(data["child_id"]):
            raise ValueError("Child not found")
        if not UserRepositories.get_by_id(data["doctor_id"]):
            raise ValueError("Doctor not found")

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