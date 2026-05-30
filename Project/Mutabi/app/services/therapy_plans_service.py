from app.repositories.therapyplansrepository import TherapyPlansRepository
from app.repositories.children_repository import ChildrenRepository
from app.models.EnumStatus import EnumStatus
from datetime import datetime, date

class TherapyPlansService:

    @staticmethod
    def create(data: dict) -> dict:
        if not ChildrenRepository.get_by_id(data["child_id"]):
            raise ValueError("Child not found")

        active_plan = TherapyPlansRepository.get_active_by_child(data["child_id"])
        if active_plan:
            raise ValueError("Child already has an active therapy plan")

        if data.get("start_date") and data.get("end_date"):
            start = datetime.strptime(data["start_date"], '%Y-%m-%d').date()
            end = datetime.strptime(data["end_date"], '%Y-%m-%d').date()
            if end <= start:
                raise ValueError("end_date must be after start_date")

        plan = TherapyPlansRepository.create({
            "child_id": data["child_id"],
            "title": data["title"],
            "start_date": data.get("start_date"),
            "end_date": data.get("end_date"),
            "status": EnumStatus.Active.value,
        })
        return plan.to_dict()

    @staticmethod
    def get_all(claims: dict) -> list:
        role = claims.get("role", "").lower()
        if role == "admin":
            return [p.to_dict() for p in TherapyPlansRepository.get_by_clinic(claims["clinic_id"])]
        return [p.to_dict() for p in TherapyPlansRepository.get_by_doctor(claims["sub"])]

    @staticmethod
    def get_by_id(plan_id: str) -> dict:
        plan = TherapyPlansRepository.get_by_id(plan_id)
        if not plan:
            raise ValueError("Therapy plan not found")
        return plan.to_dict()

    @staticmethod
    def get_by_child(child_id: str) -> list:
        if not ChildrenRepository.get_by_id(child_id):
            raise ValueError("Child not found")
        return [p.to_dict() for p in TherapyPlansRepository.get_by_child(child_id)]

    @staticmethod
    def update(plan_id: str, data: dict) -> dict:
        plan = TherapyPlansRepository.get_by_id(plan_id)
        if not plan:
            raise ValueError("Therapy plan not found")

        start = data.get("start_date") or str(plan.start_date)
        end = data.get("end_date") or str(plan.end_date)
        if start and end:
            start_date = datetime.strptime(start, '%Y-%m-%d').date()
            end_date = datetime.strptime(end, '%Y-%m-%d').date()
            if end_date <= start_date:
                raise ValueError("end_date must be after start_date")

        updated = TherapyPlansRepository.update(plan_id, data)
        return updated.to_dict()

    @staticmethod
    def delete(plan_id: str) -> dict:
        deleted = TherapyPlansRepository.delete(plan_id)
        if not deleted:
            raise ValueError("Therapy plan not found")
        return {"message": "Therapy plan deleted successfully"}