from app.models.Exercises import Exercises
from app import db
from typing import List, Optional


class ExercisesRepository:

    @staticmethod
    def create(data: dict) -> Exercises:
        exercise = Exercises(**data)
        db.session.add(exercise)
        db.session.commit()
        return exercise

    @staticmethod
    def get_by_id(exercise_id: str) -> Optional[Exercises]:
        return db.session.get(Exercises, exercise_id)

    @staticmethod
    def get_all() -> List[Exercises]:
        return db.session.query(Exercises).all()

    @staticmethod
    def update(exercise_id: str, data: dict) -> Optional[Exercises]:
        exercise = db.session.get(Exercises, exercise_id)
        if not exercise:
            return None
        for key, value in data.items():
            setattr(exercise, key, value)
        db.session.commit()
        return exercise

    @staticmethod
    def delete(exercise_id: str) -> bool:
        exercise = db.session.get(Exercises, exercise_id)
        if not exercise:
            return False
        db.session.delete(exercise)
        db.session.commit()
        return True