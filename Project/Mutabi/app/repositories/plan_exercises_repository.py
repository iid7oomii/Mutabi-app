from app.models.Plan_Exercises import PlanExercises
from app import db
from typing import List, Optional


class PlanExercisesRepository:

    @staticmethod
    def create(data: dict) -> PlanExercises:
        plan_exercise = PlanExercises(**data)
        db.session.add(plan_exercise)
        db.session.commit()
        return plan_exercise

    @staticmethod
    def get_by_id(plan_exercise_id: str) -> Optional[PlanExercises]:
        return db.session.get(PlanExercises, plan_exercise_id)

    @staticmethod
    def get_by_therapy_plan(therapy_plan_id: str) -> List[PlanExercises]:
        return (
            db.session.query(PlanExercises)
            .filter_by(therapy_plan_id=therapy_plan_id)
            .all()
        )

    @staticmethod
    def update(plan_exercise_id: str, data: dict) -> Optional[PlanExercises]:
        plan_exercise = db.session.get(PlanExercises, plan_exercise_id)
        if not plan_exercise:
            return None
        for key, value in data.items():
            setattr(plan_exercise, key, value)
        db.session.commit()
        return plan_exercise

    @staticmethod
    def delete(plan_exercise_id: str) -> bool:
        plan_exercise = db.session.get(PlanExercises, plan_exercise_id)
        if not plan_exercise:
            return False
        db.session.delete(plan_exercise)
        db.session.commit()
        return True
    
    @staticmethod
    def get_by_therapy_plan_exercise_day(therapy_plan_id: str, exercise_id: str, target_days: str):
        return (
            db.session.query(PlanExercises)
            .filter_by(
                therapy_plan_id=therapy_plan_id,
                exercise_id=exercise_id,
                target_days=target_days
            )
            .first()
        )