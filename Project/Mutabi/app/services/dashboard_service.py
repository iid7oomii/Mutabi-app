from app.repositories.children_repository import ChildrenRepository
from app.repositories.feedback_repository import FeedbackRepository
from datetime import datetime, timedelta


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
    
    @staticmethod
    def get_admin_dashboard(clinic_id: str) -> dict:
        from app.repositories.user_repsitories import UserRepositories
        from app.models.EnumUsers import RoleUser
        from datetime import datetime, timedelta

        doctors = UserRepositories.get_doctors_by_clinic(clinic_id)
        total_doctors = len(doctors)

        children = ChildrenRepository.get_by_clinic(clinic_id)
        active_patients = len(children)

        week_ago = datetime.utcnow() - timedelta(days=7)
        new_registrations = sum(
            1 for c in children
            if c.created_at and c.created_at >= week_ago
        )

        recent_onboarding = [
            {
                "id": str(d.id),
                "name": f"{d.first_name} {d.second_name}",
                "initials": f"{d.first_name[0]}{d.second_name[0]}".upper(),
                "specialty": d.specialty or "General",
                "is_active": d.is_active,
                "status": "Active" if d.is_active else "Pending",
            }
            for d in sorted(doctors, key=lambda x: x.created_at or datetime.min, reverse=True)[:5]
        ]

        return {
            "total_doctors": total_doctors,
            "active_patients": active_patients,
            "new_registrations": new_registrations,
            "recent_onboarding": recent_onboarding,
        }