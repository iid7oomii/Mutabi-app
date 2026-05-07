# repositories/therapy_plans_repository.py
from app.models.Therapy_plans import TherapyPlans
from app.models.EnumStatus import EnumStatus
from app import db
from typing import List, Optional


class TherapyPlansRepository:

    @staticmethod
    def create(data: dict) -> TherapyPlans:
        plan = TherapyPlans(**data)
        db.session.add(plan)
        db.session.commit()
        return plan

    @staticmethod
    def get_by_id(plan_id: str) -> Optional[TherapyPlans]:
        return db.session.get(TherapyPlans, plan_id)

    @staticmethod
    def get_by_child(child_id: str) -> List[TherapyPlans]:
        return db.session.query(TherapyPlans).filter_by(child_id=child_id).all()

    @staticmethod
    def get_active_by_child(child_id: str) -> Optional[TherapyPlans]:
        return (
            db.session.query(TherapyPlans)
            .filter_by(child_id=child_id, status=EnumStatus.Active)
            .first()
        )

    @staticmethod
    def get_by_doctor(doctor_id: str) -> List[TherapyPlans]:
        from app.models.Children import Children
        return (
            db.session.query(TherapyPlans)
            .join(Children)
            .filter(Children.doctor_id == doctor_id)
            .all()
        )

    @staticmethod
    def get_by_clinic(clinic_id: str) -> List[TherapyPlans]:
        from app.models.Children import Children
        return (
            db.session.query(TherapyPlans)
            .join(Children)
            .filter(Children.clinic_id == clinic_id)
            .all()
        )

    @staticmethod
    def update(plan_id: str, data: dict) -> Optional[TherapyPlans]:
        plan = db.session.get(TherapyPlans, plan_id)
        if not plan:
            return None
        for key, value in data.items():
            setattr(plan, key, value)
        db.session.commit()
        return plan

    @staticmethod
    def delete(plan_id: str) -> bool:
        plan = db.session.get(TherapyPlans, plan_id)
        if not plan:
            return False
        db.session.delete(plan)
        db.session.commit()
        return True