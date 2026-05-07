from app.repositories.exercises_repository import ExercisesRepository


class ExercisesService:

    @staticmethod
    def create(data: dict) -> dict:
        exercise = ExercisesRepository.create({
            "title": data["title"],
            "description": data["description"],
            "doctor_media_url": data.get("doctor_media_url"),
        })
        return exercise.to_dict()

    @staticmethod
    def get_all() -> list:
        return [e.to_dict() for e in ExercisesRepository.get_all()]

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
        deleted = ExercisesRepository.delete(exercise_id)
        if not deleted:
            raise ValueError("Exercise not found")
        return {"message": "Exercise deleted successfully"}