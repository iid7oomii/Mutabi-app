from app.repositories.user_repsitories import UserRepositories
from app.repositories.children_repository import ChildrenRepository
from app.repositories.clinic_repository import ClinicRepository
from app.repositories.therapyplansrepository import TherapyPlansRepository
from app.repositories.appointments_repository import AppointmentsRepository
from app.repositories.plan_exercises_repository import PlanExercisesRepository
from app.repositories.feedback_repository import FeedbackRepository
from app.models.EnumUsers import RoleUser


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
            children = ChildrenRepository.get_by_clinic(claims["clinic_id"])
        else:
            children = ChildrenRepository.get_by_doctor(claims["sub"])

        result = []
        for c in children:
            parent = UserRepositories.get_by_id(str(c.parent_id))
            doctor = UserRepositories.get_by_id(str(c.doctor_id))
            active_plan = TherapyPlansRepository.get_active_by_child(str(c.id))

            result.append({
                **c.to_dict(),
                "parent": {
                    "name": f"{parent.first_name} {parent.second_name}" if parent else "—",
                    "email": parent.email if parent else "—",
                    "phone": parent.phone if parent else "—",
                },
                "doctor": {
                    "name": f"{doctor.first_name} {doctor.second_name}" if doctor else "—",
                },
                "plan": {
                    "title": active_plan.title if active_plan else None,
                    "status": active_plan.status.value if active_plan else None,
                }
            })
        return result

    @staticmethod
    def get_by_id(child_id: str) -> dict:
        child = ChildrenRepository.get_by_id(child_id)
        if not child:
            raise ValueError("Child not found")

        parent = UserRepositories.get_by_id(str(child.parent_id))
        doctor = UserRepositories.get_by_id(str(child.doctor_id))
        active_plan = TherapyPlansRepository.get_active_by_child(child_id)
        upcoming = AppointmentsRepository.get_upcoming_by_child(child_id)

        active_plan_data = None
        if active_plan:
            plan_exercises = PlanExercisesRepository.get_by_therapy_plan(str(active_plan.id))
            total = len(plan_exercises)

            upcoming_exercises = [
                {
                    "title": pe.exercise.title,
                    "target_days": pe.target_days.value,
                    "reps": pe.reps,
                    "duration_minutes": pe.duration_minutes,
                }
                for pe in plan_exercises[:3]
            ]

            completed = 0
            for pe in plan_exercises:
                feedbacks = FeedbackRepository.get_by_plan_exercise(str(pe.id))
                if any(f.completion_status.value == 'completed' for f in feedbacks):
                    completed += 1

            completion_pct = round((completed / total) * 100) if total > 0 else 0

            active_plan_data = {
                **active_plan.to_dict(),
                "upcoming_exercises": upcoming_exercises,
                "total_exercises": total,
                "completed_exercises": completed,
                "completion_pct": completion_pct,
                "all_exercises": [
                    {
                        "id": str(pe.id),
                        "title": pe.exercise.title,
                        "target_days": pe.target_days.value,
                        "reps": pe.reps,
                        "duration_minutes": pe.duration_minutes,
                    }
                    for pe in plan_exercises
                ],
            }

        return {
            **child.to_dict(),
            "parent": {
                "name": f"{parent.first_name} {parent.second_name}" if parent else "—",
                "email": parent.email if parent else "—",
                "phone": parent.phone if parent else "—",
                "relationship_type": parent.relationship_type.value if parent and parent.relationship_type else "—",
            },
            "doctor": {
                "name": f"{doctor.first_name} {doctor.second_name}" if doctor else "—",
                "specialty": doctor.specialty if doctor else "—",
            },
            "active_plan": active_plan_data,
            "upcoming_appointment": upcoming.to_dict() if upcoming else None,
        }

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
    

    @staticmethod
    def register_family(data: dict, claims: dict) -> dict:
        from app import db
        from app.services.auth_service import AuthService
        
        try:
            
            parent_user = UserRepositories.create({
                "clinic_id": claims["clinic_id"],
                "first_name": data["parent_first_name"],
                "second_name": data["parent_second_name"],
                "email": data["parent_email"],
                "phone": data.get("parent_phone"),
                "password": data["parent_password"],
                "role": RoleUser.Parent,
                "relationship_type": data["parent_relationship"],
                "is_active": True
            })

            child = ChildrenRepository.create({
                "clinic_id": claims["clinic_id"],
                "parent_id": str(parent_user.id),
                "doctor_id": data["doctor_id"],
                "first_name": data["child_first_name"],
                "second_name": data["child_second_name"],
                "date_of_birth": data["date_of_birth"],
                "diagnosis_notes": data.get("diagnosis_notes"),
            })

            db.session.commit()

            return {
                "parent": parent_user.to_dict(exclude=["password"]),
                "child": child.to_dict(),
            }

        except Exception as e:
            db.session.rollback()
            raise ValueError(str(e))