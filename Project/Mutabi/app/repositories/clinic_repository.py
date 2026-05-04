from app.models.Clinics import Clinic
from app import db

class ClinicRepository:

    @staticmethod
    def create(data: dict) -> Clinic:
        clinic = Clinic(**data)
        db.session.add(clinic)
        db.session.commit()
        return clinic

    @staticmethod
    def get_by_id(clinic_id: str) -> Clinic | None:
        return db.session.get(Clinic, clinic_id)