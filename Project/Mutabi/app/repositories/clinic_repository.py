from typing import List, Optional
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
    def get_by_id(clinic_id: str) -> Optional[Clinic]:
        return db.session.get(Clinic, clinic_id)

    @staticmethod
    def get_all() -> List[Clinic]:
        return db.session.query(Clinic).order_by(Clinic.created_at.desc()).all()

    @staticmethod
    def update(clinic_id: str, data: dict) -> Optional[Clinic]:
        clinic = db.session.get(Clinic, clinic_id)
        if not clinic:
            return None
        for key, value in data.items():
            setattr(clinic, key, value)
        db.session.commit()
        return clinic

    @staticmethod
    def delete(clinic_id: str) -> bool:
        clinic = db.session.get(Clinic, clinic_id)
        if not clinic:
            return False
        db.session.delete(clinic)
        db.session.commit()
        return True