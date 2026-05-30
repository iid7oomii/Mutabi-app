from flask import Blueprint, jsonify, request, g
import jwt
import os
from app.services.dashboard_service import DashboardService
from app.api.v1.middleware.role_required import role_required
from app.repositories.plan_exercises_repository import PlanExercisesRepository
from app.repositories.children_repository import ChildrenRepository
from app.repositories.doctor_notes_repository import DoctorNotesRepository
from app.repositories.appointments_repository import AppointmentsRepository
from app.repositories.therapyplansrepository import TherapyPlansRepository
from app.repositories.user_repsitories import UserRepositories
from app.repositories.clinic_repository import ClinicRepository
from app.repositories.feedback_repository import FeedbackRepository
from datetime import datetime, timedelta


dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@dashboard_bp.route("/admin", methods=["GET"])
@role_required("Admin")
def admin_dashboard():
    try:
        claims = g.jwt_claims
        clinic_id = claims["clinic_id"]
        data = DashboardService.get_admin_dashboard(clinic_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/doctor", methods=["GET"])
@role_required("Admin", "Doctor")
def doctor_dashboard():
    try:
        token = request.cookies.get('token')
        if not token:
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        payload = jwt.decode(
            token,
            os.getenv('JWT_SECRET_KEY'),
            algorithms=["HS256"]
        )
        doctor_id = payload["sub"]
        data = DashboardService.get_doctor_dashboard(doctor_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

def calculate_streak(child_id: str) -> int:
    streak = 0
    today = datetime.utcnow().date()
    
    for i in range(90):
        day = today - timedelta(days=i)
        feedbacks = FeedbackRepository.get_by_date_and_child(child_id, day)
        if any(f.completion_status.value == 'completed' for f in feedbacks):
            streak += 1
        elif i > 0:
            break
    return streak

@dashboard_bp.route("/parent", methods=["GET"])
@role_required("Parent")
def parent_home():
    try:
        claims = g.jwt_claims
        parent_id = claims["sub"]
        clinic_id = claims["clinic_id"]



        parent = UserRepositories.get_by_id(parent_id)
        clinic = ClinicRepository.get_by_id(clinic_id)

        children = ChildrenRepository.get_by_parent(parent_id)
        if not children:
            return jsonify({
                "parent_name": f"{parent.first_name} {parent.second_name}",
                "clinic_name": clinic.name if clinic else "",
                "child": None,
                "active_plan": None,
                "latest_note": None,
                "upcoming_appointment": None,
                "email": parent.email,
            }), 200

        child = children[0]
        child_id = str(child.id)
        active_plan = TherapyPlansRepository.get_active_by_child(child_id)
        latest_note = DoctorNotesRepository.get_latest_by_child(child_id)
        upcoming = AppointmentsRepository.get_upcoming_by_child(child_id)
        today_exercises = PlanExercisesRepository.get_today_by_child(child_id)

        return jsonify({
            "parent_name": f"{parent.first_name} {parent.second_name}",
            "email": parent.email,
            "clinic_name": clinic.name if clinic else "",
            "child": {
                "id": child_id,
                "name": f"{child.first_name} {child.second_name}",
            },
            "active_plan": active_plan.to_dict() if active_plan else None,
            "latest_note": {
                **latest_note.to_dict(),
                "doctor_name": f"{latest_note.doctor.first_name} {latest_note.doctor.second_name}",
                "doctor_specialty": latest_note.doctor.specialty,
            } if latest_note else None,
            "upcoming_appointment": upcoming.to_dict() if upcoming else None,
            "today_exercises": [
            {
                "id": str(pe.id),
                "exercise_title": pe.exercise.title,
                "exercise_description": pe.exercise.description,
                "reps": pe.reps,
                "duration_minutes": pe.duration_minutes,
                }
                for pe in today_exercises ],
            "weekly_streak": calculate_streak(child_id),
            
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@dashboard_bp.route("/parent/exercises/<day>", methods=["GET"])
@role_required("Parent")
def get_exercises_by_day(day):
    try:
        claims = g.jwt_claims
        parent_id = claims["sub"]
        
        children = ChildrenRepository.get_by_parent(parent_id)
        if not children:
            return jsonify([]), 200
        
        child_id = str(children[0].id)
        exercises = PlanExercisesRepository.get_by_day_and_child(child_id, day)
        
        return jsonify([
            {
                "id": str(pe.id),
                "exercise_title": pe.exercise.title,
                "exercise_description": pe.exercise.description,
                "reps": pe.reps,
                "duration_minutes": pe.duration_minutes,
            }
            for pe in exercises
        ]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500