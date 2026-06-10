from app.repositories.exercises_repository import ExercisesRepository
from app.integrations.storage import S3StorageClient
from app.repositories.plan_exercises_repository import PlanExercisesRepository
from app.repositories.therapyplansrepository import TherapyPlansRepository
from app.repositories.children_repository import ChildrenRepository



class ExercisesService:

    @staticmethod
    def create(data: dict, clinic_id: str = None) -> dict:
        exercise = ExercisesRepository.create({
            "clinic_id": clinic_id,
            "title": data["title"],
            "description": data["description"],
            "doctor_media_url": data.get("doctor_media_url"),
            "icon": data.get("icon"),
            "difficulty": data.get("difficulty"),
            "goal": data.get("goal"),
            "steps_json": data.get("steps_json"),
        })
        return exercise.to_dict()

    @staticmethod
    def get_all(clinic_id: str = None) -> list:
        return [e.to_dict() for e in ExercisesRepository.get_all(clinic_id)]

    @staticmethod
    def get_by_id(exercise_id: str) -> dict:
        exercise = ExercisesRepository.get_by_id(exercise_id)
        if not exercise:
            raise ValueError("Exercise not found")
        return exercise.to_dict()

    @staticmethod
    def update(exercise_id: str, data: dict) -> dict:
        exercise = ExercisesRepository.update(exercise_id, data)
        if not exercise:
            raise ValueError("Exercise not found")
        return exercise.to_dict()

    @staticmethod
    def delete(exercise_id: str) -> dict:
        exercise = ExercisesRepository.get_by_id(exercise_id)
        if not exercise:
            raise ValueError("Exercise not found")

        plan_exercises = PlanExercisesRepository.get_by_exercise(exercise_id)
        for pe in plan_exercises:
            plan = TherapyPlansRepository.get_by_id(str(pe.therapy_plan_id))
            if plan and plan.status.value == 'active':
                child = ChildrenRepository.get_by_id(str(plan.child_id))
                child_name = f"{child.first_name} {child.second_name}" if child else "Unknown"
                raise ValueError(
                    f"This exercise is part of an active therapy plan for {child_name}. "
                    f"Please remove it from the plan before deleting."
                )

        if exercise.doctor_media_url:
            try:
                key = '/'.join(exercise.doctor_media_url.split('/')[-2:])
                client = S3StorageClient()
                client.delete(key)
            except Exception:
                pass

        deleted = ExercisesRepository.delete(exercise_id)
        if not deleted:
            raise ValueError("Exercise not found")
        return {"message": "Exercise deleted successfully"}