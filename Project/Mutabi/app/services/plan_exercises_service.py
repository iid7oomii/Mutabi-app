from app.repositories.plan_exercises_repository import PlanExercisesRepository
from app.repositories.therapyplansrepository import TherapyPlansRepository
from app.repositories.exercises_repository import ExercisesRepository


class PlanExercisesService:

    @staticmethod
    def create(data: dict) -> dict:
        if not TherapyPlansRepository.get_by_id(data["therapy_plan_id"]):
            raise ValueError("Therapy plan not found")

        if not ExercisesRepository.get_by_id(data["exercise_id"]):
            raise ValueError("Exercise not found")
        
        if not data.get("reps") and not data.get("duration_minutes"):
            raise ValueError("Either reps or duration_minutes must be provided")
        
        existing = PlanExercisesRepository.get_by_therapy_plan_exercise_day(
            data["therapy_plan_id"],
            data["exercise_id"],
            data["target_days"]
        )
        if existing:
            raise ValueError("This exercise already exists for this day in the therapy plan")

        plan_exercise = PlanExercisesRepository.create({
            "therapy_plan_id": data["therapy_plan_id"],
            "exercise_id": data["exercise_id"],
            "reps": data.get("reps"),
            "duration_minutes": data.get("duration_minutes"),
            "target_days": data["target_days"],
        })
        return plan_exercise.to_dict()

    @staticmethod
    def get_by_therapy_plan(therapy_plan_id: str) -> list:
        if not TherapyPlansRepository.get_by_id(therapy_plan_id):
            raise ValueError("Therapy plan not found")
        return [p.to_dict() for p in PlanExercisesRepository.get_by_therapy_plan(therapy_plan_id)]

    @staticmethod
    def get_by_id(plan_exercise_id: str) -> dict:
        plan_exercise = PlanExercisesRepository.get_by_id(plan_exercise_id)
        if not plan_exercise:
            raise ValueError("Plan exercise not found")
        return plan_exercise.to_dict()

    @staticmethod
    def update(plan_exercise_id: str, data: dict) -> dict:
        plan_exercise = PlanExercisesRepository.get_by_id(plan_exercise_id)
        if not plan_exercise:
            raise ValueError("Plan exercise not found")

        reps = data.get("reps", plan_exercise.reps)
        duration = data.get("duration_minutes", plan_exercise.duration_minutes)
        if not reps and not duration:
            raise ValueError("Either reps or duration_minutes must be provided")

        updated = PlanExercisesRepository.update(plan_exercise_id, data)
        return updated.to_dict()

    @staticmethod
    def delete(plan_exercise_id: str) -> dict:
        deleted = PlanExercisesRepository.delete(plan_exercise_id)
        if not deleted:
            raise ValueError("Plan exercise not found")
        return {"message": "Plan exercise deleted successfully"}