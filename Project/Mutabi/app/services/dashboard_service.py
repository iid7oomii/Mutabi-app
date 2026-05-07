from datetime import datetime, timedelta
from app.repositories.children_repository import ChildrenRepository
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.user_repsitories import UserRepositories
from app.models.EnumUsers import RoleUser


class DashboardService:

    @staticmethod
    def get_admin_dashboard(clinic_id: str) -> dict:
        active_doctors = UserRepositories.get_doctors_by_clinic(clinic_id)

        all_users = UserRepositories.get_by_clinic(clinic_id)
        all_doctors = [u for u in all_users if u.role == RoleUser.Doctor]

        all_children = ChildrenRepository.get_by_clinic(clinic_id)
        active_patients = [c for c in all_children if c.therapy_plan]

        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        new_registrations = [
            u for u in all_users
            if u.created_at and u.created_at >= seven_days_ago
        ]

        recent_doctors = sorted(
            all_doctors,
            key=lambda d: d.created_at if d.created_at else datetime.min,
            reverse=True,
        )[:10]

        recent_onboarding = []
        for doctor in recent_doctors:
            first = doctor.first_name or ''
            second = doctor.second_name or ''
            initials = (first[0] if first else '') + (second[0] if second else '')
            recent_onboarding.append({
                "id": str(doctor.id),
                "name": f"Dr. {first} {second}".strip(),
                "initials": initials.upper(),
                "specialty": doctor.specialty or "—",
                "is_active": doctor.is_active,
                "status": "Active" if doctor.is_active else "Pending Review",
            })

        return {
            "total_doctors": len(active_doctors),
            "active_patients": len(active_patients),
            "new_registrations": len(new_registrations),
            "recent_onboarding": recent_onboarding,
        }

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
