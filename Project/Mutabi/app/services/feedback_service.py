from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.plan_exercises_repository import PlanExercisesRepository
from datetime import datetime



class FeedbackService:

    @staticmethod
    def create(data: dict) -> dict:
        if not PlanExercisesRepository.get_by_id(data["plan_exercise_id"]):
            raise ValueError("Plan exercise not found")

        from datetime import datetime
        feedback_date = datetime.strptime(data["feedback_date"], '%Y-%m-%d').date()
        existing = FeedbackRepository.get_by_plan_exercise_and_date(
            data["plan_exercise_id"],
            feedback_date
        )
        if existing:
            raise ValueError("Feedback already exists for this exercise today")

        feedback = FeedbackRepository.create({
            "plan_exercise_id": data["plan_exercise_id"],
            "feedback_date": feedback_date,
            "completion_status": data["completion_status"],
            "pain_level": data["pain_level"],
            "parent_notes": data.get("parent_notes"),
            "parent_media_url": data.get("parent_media_url"),
        })
        return feedback.to_dict()

    @staticmethod
    def get_by_plan_exercise(plan_exercise_id: str) -> list:
        if not PlanExercisesRepository.get_by_id(plan_exercise_id):
            raise ValueError("Plan exercise not found")
        return [f.to_dict() for f in FeedbackRepository.get_by_plan_exercise(plan_exercise_id)]

    @staticmethod
    def get_by_id(feedback_id: str) -> dict:
        feedback = FeedbackRepository.get_by_id(feedback_id)
        if not feedback:
            raise ValueError("Feedback not found")
        return feedback.to_dict()

    @staticmethod
    def get_recent_by_doctor(doctor_id: str, limit: int = 10) -> list:
        feedbacks = FeedbackRepository.get_recent_by_doctor(doctor_id, limit)
        return [
            {
                **f.to_dict(),
                "exercise": f.plan_exercise.exercise.title,
                "child": f"{f.plan_exercise.therapy_plan.children.first_name} {f.plan_exercise.therapy_plan.children.second_name}",
            }
            for f in feedbacks
        ]

    @staticmethod
    def update(feedback_id: str, data: dict) -> dict:
        feedback = FeedbackRepository.update(feedback_id, data)
        if not feedback:
            raise ValueError("Feedback not found")
        return feedback.to_dict()

    @staticmethod
    def delete(feedback_id: str) -> dict:
        deleted = FeedbackRepository.delete(feedback_id)
        if not deleted:
            raise ValueError("Feedback not found")
        return {"message": "Feedback deleted successfully"}