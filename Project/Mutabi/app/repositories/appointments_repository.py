# app/repositories/appointments_repository.py
from app.models.Appointments import Appointments
from app import db
from typing import List, Optional
from datetime import date


class AppointmentsRepository:

    @staticmethod
    def create(data: dict) -> Appointments:
        appointment = Appointments(**data)
        db.session.add(appointment)
        db.session.commit()
        return appointment

    @staticmethod
    def get_by_id(appointment_id: str) -> Optional[Appointments]:
        return db.session.get(Appointments, appointment_id)

    @staticmethod
    def get_by_child(child_id: str) -> List[Appointments]:
        return (
            db.session.query(Appointments)
            .filter_by(child_id=child_id)
            .order_by(Appointments.appointment.asc())
            .all()
        )

    @staticmethod
    def get_upcoming_by_child(child_id: str) -> Optional[Appointments]:
        return (
            db.session.query(Appointments)
            .filter(
                Appointments.child_id == child_id,
                Appointments.appointment >= date.today()
            )
            .order_by(Appointments.appointment.asc())
            .first()
        )

    @staticmethod
    def get_by_doctor(doctor_id: str) -> List[Appointments]:
        return (
            db.session.query(Appointments)
            .filter_by(doctor_id=doctor_id)
            .order_by(Appointments.appointment.asc())
            .all()
        )

    @staticmethod
    def update(appointment_id: str, data: dict) -> Optional[Appointments]:
        appointment = db.session.get(Appointments, appointment_id)
        if not appointment:
            return None
        for key, value in data.items():
            setattr(appointment, key, value)
        db.session.commit()
        return appointment

    @staticmethod
    def delete(appointment_id: str) -> bool:
        appointment = db.session.get(Appointments, appointment_id)
        if not appointment:
            return False
        db.session.delete(appointment)
        db.session.commit()
        return True