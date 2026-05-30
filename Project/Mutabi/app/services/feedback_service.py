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
    


    @staticmethod
    def get_by_child(child_id: str) -> list:
        from app.repositories.plan_exercises_repository import PlanExercisesRepository
        from app.repositories.therapyplansrepository import TherapyPlansRepository

        active_plan = TherapyPlansRepository.get_active_by_child(child_id)
        if not active_plan:
            return []

        plan_exercises = PlanExercisesRepository.get_by_therapy_plan(str(active_plan.id))
        
        result = []
        for pe in plan_exercises:
            feedbacks = FeedbackRepository.get_by_plan_exercise(str(pe.id))
            for f in feedbacks:
                result.append({
                    **f.to_dict(),
                    "exercise_title": pe.exercise.title,
                    "target_days": pe.target_days.value,
                })
        
        result.sort(key=lambda x: x.get("feedback_date", ""), reverse=True)
        return result
    

    @staticmethod
    def get_all_by_doctor(doctor_id: str) -> list:
        feedbacks = FeedbackRepository.get_recent_by_doctor(doctor_id, limit=50)
        result = []
        for f in feedbacks:
            child = f.plan_exercise.therapy_plan.children
            parent = child.parent
            result.append({
                **f.to_dict(),
                "exercise_title": f.plan_exercise.exercise.title,
                "child_id": str(child.id),
                "child_name": f"{child.first_name} {child.second_name}",
                "parent_name": f"{parent.first_name} {parent.second_name}",
                "parent_relationship": parent.relationship_type.value if parent.relationship_type else "—",
            })
        return result
    

    @staticmethod
    def get_doctor_progress(doctor_id: str) -> dict:
        from app.repositories.children_repository import ChildrenRepository
        from app.repositories.therapyplansrepository import TherapyPlansRepository
        from app.repositories.plan_exercises_repository import PlanExercisesRepository

        children = ChildrenRepository.get_by_doctor(doctor_id)
        total_patients = len(children)
        
        all_feedback = []
        pending_plans = 0
        
        for child in children:
            active_plan = TherapyPlansRepository.get_active_by_child(str(child.id))
            if not active_plan:
                pending_plans += 1
                continue
                
            plan_exercises = PlanExercisesRepository.get_by_therapy_plan(str(active_plan.id))
            for pe in plan_exercises:
                feedbacks = FeedbackRepository.get_by_plan_exercise(str(pe.id))
                for f in feedbacks:
                    parent = child.parent
                    all_feedback.append({
                        **f.to_dict(),
                        "exercise_title": pe.exercise.title,
                        "target_days": pe.target_days.value,
                        "child_id": str(child.id),
                        "child_name": f"{child.first_name} {child.second_name}",
                        "parent_name": f"{parent.first_name} {parent.second_name}" if parent else "—",
                    })

        all_feedback.sort(key=lambda x: x.get("feedback_date", ""), reverse=True)
        
        total = len(all_feedback)
        completed = sum(1 for f in all_feedback if f["completion_status"] == "completed")
        adherence_rate = round((completed / total) * 100) if total > 0 else 0

        return {
            "adherence_rate": adherence_rate,
            "total_patients": total_patients,
            "pending_plans": pending_plans,
            "feedback": all_feedback,
        }