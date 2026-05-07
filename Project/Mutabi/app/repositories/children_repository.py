# repositories/children_repository.py
from app.models.Children import Children
from app.models.Therapy_plans import TherapyPlans
from app import db
from typing import List, Optional


class ChildrenRepository:

    @staticmethod
    def create(data: dict) -> Children:
        child = Children(**data)
        db.session.add(child)
        db.session.commit()
        return child

    @staticmethod
    def get_by_id(child_id: str) -> Optional[Children]:
        return db.session.get(Children, child_id)

    @staticmethod
    def get_by_doctor(doctor_id: str) -> List[Children]:
        return db.session.query(Children).filter_by(doctor_id=doctor_id).all()

    @staticmethod
    def get_by_clinic(clinic_id: str) -> List[Children]:
        return db.session.query(Children).filter_by(clinic_id=clinic_id).all()

    @staticmethod
    def get_without_plan(doctor_id: str) -> List[Children]:
        return (
            db.session.query(Children)
            .filter_by(doctor_id=doctor_id)
            .filter(~Children.therapy_plan.any())
            .all()
        )

    @staticmethod
    def count_by_doctor(doctor_id: str) -> int:
        return db.session.query(Children).filter_by(doctor_id=doctor_id).count()

    @staticmethod
    def update(child_id: str, data: dict) -> Optional[Children]:
        child = db.session.get(Children, child_id)
        if not child:
            return None
        for key, value in data.items():
            setattr(child, key, value)
        db.session.commit()
        return child

    @staticmethod
    def delete(child_id: str) -> bool:
        child = db.session.get(Children, child_id)
        if not child:
            return False
        db.session.delete(child)
        db.session.commit()
        return True