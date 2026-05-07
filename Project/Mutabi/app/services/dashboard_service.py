from app.repositories.children_repository import ChildrenRepository
from app.repositories.feedback_repository import FeedbackRepository


class DashboardService:

    @staticmethod
    def get_doctor_dashboard(doctor_id: str) -> dict:
        children_without_plan = ChildrenRepository.get_without_plan(doctor_id)
        assigned_count = ChildrenRepository.count_by_doctor(doctor_id)
        skipped_count = FeedbackRepository.count_skipped_by_doctor(doctor_id)
        recent_feedback = FeedbackRepository.get_recent_by_doctor(doctor_id)

        return {
            "assigned_patients": assigned_count,
            "skipped_sessions": skipped_count,
            "patients_without_plan": [
                {
                    "id": str(c.id),
                    "name": f"{c.first_name} {c.second_name}"
                }
                for c in children_without_plan
            ],
            "recent_feedback": [
                {
                    "id": str(f.id),
                    "date": str(f.feedback_date),
                    "status": f.completion_status.value,
                    "notes": f.parent_notes,
                    "exercise": f.plan_exercise.exercise.title,
                    "child": f"{f.plan_exercise.therapy_plan.children.first_name} {f.plan_exercise.therapy_plan.children.second_name}",
                }
                for f in recent_feedback
            ]
        }