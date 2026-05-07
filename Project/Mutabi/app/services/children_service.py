from app.repositories.user_repsitories import UserRepositories
from app.repositories.children_repository import ChildrenRepository
from app.repositories.clinic_repository import ClinicRepository


class ChildrenService:

    @staticmethod
    def create(data: dict, clinic_id: str) -> dict:

        if not UserRepositories.get_by_id(data["parent_id"]):
            raise ValueError("Parent not found")

        if not UserRepositories.get_by_id(data["doctor_id"]):
            raise ValueError("Doctor not found")

        if not ClinicRepository.get_by_id(clinic_id):
            raise ValueError("Clinic not found")

        child = ChildrenRepository.create({
            "clinic_id": clinic_id,
            "parent_id": data["parent_id"],
            "doctor_id": data["doctor_id"],
            "first_name": data["first_name"],
            "second_name": data["second_name"],
            "date_of_birth": data["date_of_birth"],
            "diagnosis_notes": data.get("diagnosis_notes"),
        })
        return child.to_dict()

    @staticmethod
    def get_all(claims: dict) -> list:
        role = claims.get("role", "").lower()
        if role == "admin":
            return [c.to_dict() for c in ChildrenRepository.get_by_clinic(claims["clinic_id"])]
        return [c.to_dict() for c in ChildrenRepository.get_by_doctor(claims["sub"])]

    @staticmethod
    def get_by_id(child_id: str) -> dict:
        child = ChildrenRepository.get_by_id(child_id)
        if not child:
            raise ValueError("Child not found")
        return child.to_dict()

    @staticmethod
    def update(child_id: str, data: dict) -> dict:
        child = ChildrenRepository.update(child_id, data)
        if not child:
            raise ValueError("Child not found")
        return child.to_dict()

    @staticmethod
    def delete(child_id: str) -> dict:
        deleted = ChildrenRepository.delete(child_id)
        if not deleted:
            raise ValueError("Child not found")
        return {"message": "Child deleted successfully"}