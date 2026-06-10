from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import get_jwt
from app.services.feedback_service import FeedbackService
from app.api.v1.middleware.role_required import role_required
from app.repositories.user_repsitories import UserRepositories
from app.repositories.children_repository import ChildrenRepository
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.notification_repository import NotificationRepository
from app.integrations.notifications import FCMNotificationClient

feedback_bp = Blueprint("feedback", __name__, url_prefix="/feedback")


@feedback_bp.route("/", methods=["POST"])
@role_required("Admin", "Doctor", "Parent")
def create_feedback():
    """
    Create Feedback
    ---
    tags:
      - Feedback
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - plan_exercise_id
            - feedback_date
            - completion_status
            - pain_level
          properties:
            plan_exercise_id:
              type: string
              example: "uuid-here"
            feedback_date:
              type: string
              example: "2026-05-06"
            completion_status:
              type: string
              example: "completed"
            pain_level:
              type: integer
              example: 3
            parent_notes:
              type: string
              example: "الطفل تعاون بشكل جيد"
            parent_media_url:
              type: string
              example: "https://bucket.amazonaws.com/video.mp4"
    responses:
      201:
        description: تم إنشاء الـ feedback بنجاح
      400:
        description: خطأ في البيانات
    """
    try:
        data = request.get_json()
        result = FeedbackService.create(data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@feedback_bp.route("/plan-exercise/<plan_exercise_id>", methods=["GET"])
@role_required("Admin", "Doctor")
def get_by_plan_exercise(plan_exercise_id):
    """
    Get Feedback By Plan Exercise
    ---
    tags:
      - Feedback
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: plan_exercise_id
        required: true
        type: string
    responses:
      200:
        description: قائمة الـ feedback
      404:
        description: التمرين غير موجود
    """
    try:
        result = FeedbackService.get_by_plan_exercise(plan_exercise_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@feedback_bp.route("/<feedback_id>", methods=["GET"])
@role_required("Admin", "Doctor")
def get_feedback(feedback_id):
    """
    Get Feedback
    ---
    tags:
      - Feedback
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: feedback_id
        required: true
        type: string
    responses:
      200:
        description: بيانات الـ feedback
      404:
        description: الـ feedback غير موجود
    """
    try:
        result = FeedbackService.get_by_id(feedback_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@feedback_bp.route("/doctor/recent", methods=["GET"])
@role_required("Doctor")
def get_recent_by_doctor():
    """
    Get Recent Feedback By Doctor
    ---
    tags:
      - Feedback
    consumes:
      - application/json
    security:
      - Bearer: []
    responses:
      200:
        description: آخر الـ feedback
    """
    try:
        claims = get_jwt()
        doctor_id = claims["sub"]
        result = FeedbackService.get_recent_by_doctor(doctor_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@feedback_bp.route("/<feedback_id>", methods=["PUT"])
@role_required("Admin", "Doctor", "Parent")
def update_feedback(feedback_id):
    """
    Update Feedback
    ---
    tags:
      - Feedback
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: feedback_id
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            completion_status:
              type: string
              example: "completed"
            pain_level:
              type: integer
              example: 3
            parent_notes:
              type: string
              example: "ملاحظات محدثة"
            parent_media_url:
              type: string
              example: "https://bucket.amazonaws.com/video.mp4"
    responses:
      200:
        description: تم التحديث بنجاح
      404:
        description: الـ feedback غير موجود
    """
    try:
        data = request.get_json()
        result = FeedbackService.update(feedback_id, data)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@feedback_bp.route("/<feedback_id>", methods=["DELETE"])
@role_required("Admin", "Doctor")
def delete_feedback(feedback_id):
    """
    Delete Feedback
    ---
    tags:
      - Feedback
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: feedback_id
        required: true
        type: string
    responses:
      200:
        description: تم الحذف بنجاح
      404:
        description: الـ feedback غير موجود
    """
    try:
        result = FeedbackService.delete(feedback_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    


@feedback_bp.route("/child/<child_id>", methods=["GET"])
@role_required("Admin", "Doctor")
def get_by_child(child_id):
    """
    Get Feedback By Child
    ---
    tags:
      - Feedback
    security:
      - Bearer: []
    parameters:
      - in: path
        name: child_id
        required: true
        type: string
    responses:
      200:
        description: قائمة الـ feedback
    """
    try:
        result = FeedbackService.get_by_child(child_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
            

@feedback_bp.route("/doctor/all", methods=["GET"])
@role_required("Doctor", "Admin")
def get_all_by_doctor():
    try:
        claims = g.jwt_claims
        role = claims.get("role", "").lower()
        
        if role == "admin":
            doctors = UserRepositories.get_doctors_by_clinic(claims["clinic_id"])
            all_feedback = []
            for doctor in doctors:
                all_feedback += FeedbackService.get_all_by_doctor(str(doctor.id))
            return jsonify(all_feedback), 200
        else:
            result = FeedbackService.get_all_by_doctor(claims["sub"])
            return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@feedback_bp.route("/<feedback_id>/reply", methods=["PUT"])
@role_required("Doctor", "Admin")
def reply_to_feedback(feedback_id):
    try:
        data = request.get_json()
        result = FeedbackService.update(feedback_id, {"doctor_reply": data["reply"]})

        try:
            feedback = FeedbackRepository.get_by_id(feedback_id)
            if feedback:
                parent = feedback.plan_exercise.therapy_plan.children.parent
                doctor = feedback.plan_exercise.therapy_plan.children.doctor
                doctor_name = f"{doctor.first_name} {doctor.second_name}" if doctor else "الدكتور"

                NotificationRepository.create(
                    user_id=str(parent.id),
                    title="رد الدكتور",
                    body=f"د. {doctor_name} رد على تقريرك.",
                    type="feedback_reply",
                )

                if parent.device_token:
                    FCMNotificationClient().notify_parent_feedback_reply(
                        parent.device_token, doctor_name
                    )
        except Exception as notif_err:
            print(f"[Notification] Failed: {notif_err}")

        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    

@feedback_bp.route("/parent/history", methods=["GET"])
@role_required("Parent")
def get_parent_history():
    """Get full feedback history for the parent's child."""
    try:
        claims = g.jwt_claims
        parent_id = claims["sub"]

        children = ChildrenRepository.get_by_parent(parent_id)
        if not children:
            return jsonify([]), 200

        child_id_param = request.args.get('child_id')
        if child_id_param:
            child = next((c for c in children if str(c.id) == child_id_param), children[0])
        else:
            child = children[0]
        child_id = str(child.id)
        feedbacks = FeedbackRepository.get_all_by_child(child_id)

        result = []
        for f in feedbacks:
            result.append({
                "id": str(f.id),
                "date": str(f.feedback_date),
                "completion_status": f.completion_status.value if hasattr(f.completion_status, 'value') else f.completion_status,
                "pain_level": f.pain_level,
                "exercise_title": f.plan_exercise.exercise.title,
                "notes": f.parent_notes or "",
                "created_at": f.created_at.isoformat() if f.created_at else str(f.feedback_date),
            })

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@feedback_bp.route("/doctor/progress", methods=["GET"])
@role_required("Doctor", "Admin")
def get_doctor_progress():
    try:
        claims = g.jwt_claims
        role = claims.get("role", "").lower()

        if role == "admin":
            doctors = UserRepositories.get_doctors_by_clinic(claims["clinic_id"])
            
            adherence_total = 0
            all_feedback = []
            pending_plans = 0
            total_patients = 0

            for doctor in doctors:
                result = FeedbackService.get_doctor_progress(str(doctor.id))
                all_feedback += result["feedback"]
                pending_plans += result["pending_plans"]
                total_patients += result["total_patients"]

            total = len(all_feedback)
            completed = sum(1 for f in all_feedback if f["completion_status"] == "completed")
            adherence_rate = round((completed / total) * 100) if total > 0 else 0
            all_feedback.sort(key=lambda x: x.get("feedback_date", ""), reverse=True)

            return jsonify({
                "adherence_rate": adherence_rate,
                "total_patients": total_patients,
                "pending_plans": pending_plans,
                "feedback": all_feedback,
            }), 200
        else:
            result = FeedbackService.get_doctor_progress(claims["sub"])
            return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
