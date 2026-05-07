from app.models.Exercises_Feedback import ExercisesFeedback
from app.models.Plan_Exercises import PlanExercises
from app.models.Therapy_plans import TherapyPlans
from app.models.Children import Children
from app.models.EnumCompletion import EnumCompletion
from app import db
from typing import List, Optional


class FeedbackRepository:

    @staticmethod
    def create(data: dict) -> ExercisesFeedback:
        feedback = ExercisesFeedback(**data)
        db.session.add(feedback)
        db.session.commit()
        return feedback

    @staticmethod
    def get_by_id(feedback_id: str) -> Optional[ExercisesFeedback]:
        return db.session.get(ExercisesFeedback, feedback_id)

    @staticmethod
    def get_by_plan_exercise(plan_exercise_id: str) -> List[ExercisesFeedback]:
        return (
            db.session.query(ExercisesFeedback)
            .filter_by(plan_exercise_id=plan_exercise_id)
            .all()
        )

    @staticmethod
    def get_recent_by_doctor(doctor_id: str, limit: int = 10) -> List[ExercisesFeedback]:
        return (
            db.session.query(ExercisesFeedback)
            .join(PlanExercises)
            .join(TherapyPlans)
            .join(Children)
            .filter(Children.doctor_id == doctor_id)
            .order_by(ExercisesFeedback.feedback_date.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def count_skipped_by_doctor(doctor_id: str) -> int:
        return (
            db.session.query(ExercisesFeedback)
            .join(PlanExercises)
            .join(TherapyPlans)
            .join(Children)
            .filter(
                Children.doctor_id == doctor_id,
                ExercisesFeedback.completion_status == EnumCompletion.Skipped
            )
            .count()
        )

    @staticmethod
    def update(feedback_id: str, data: dict) -> Optional[ExercisesFeedback]:
        feedback = db.session.get(ExercisesFeedback, feedback_id)
        if not feedback:
            return None
        for key, value in data.items():
            setattr(feedback, key, value)
        db.session.commit()
        return feedback

    @staticmethod
    def delete(feedback_id: str) -> bool:
        feedback = db.session.get(ExercisesFeedback, feedback_id)
        if not feedback:
            return False
        db.session.delete(feedback)
        db.session.commit()
        return True
    
    @staticmethod
    def get_by_plan_exercise_and_date(plan_exercise_id: str, feedback_date) -> Optional[ExercisesFeedback]:
        return (
            db.session.query(ExercisesFeedback)
            .filter_by(
                plan_exercise_id=plan_exercise_id,
                feedback_date=feedback_date
            )
            .first()
        )