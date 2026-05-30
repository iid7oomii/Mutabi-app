from flask import Blueprint, request, jsonify, g
from app.services.doctor_notes_service import DoctorNotesService
from app.api.v1.middleware.role_required import role_required
from app.repositories.children_repository import ChildrenRepository
from app.repositories.user_repsitories import UserRepositories
from app.repositories.notification_repository import NotificationRepository
from app.integrations.notifications import FCMNotificationClient

doctor_notes_bp = Blueprint("doctor_notes", __name__, url_prefix="/doctor-notes")


@doctor_notes_bp.route("/", methods=["POST"])
@role_required("Admin", "Doctor")
def create_note():
    """
    Create Doctor Note
    ---
    tags:
      - Doctor Notes
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
            - child_id
            - content
          properties:
            child_id:
              type: string
              example: "uuid-here"
            content:
              type: string
              example: "Great progress with the sensory tools!"
    responses:
      201:
        description: تم إنشاء الملاحظة بنجاح
      400:
        description: خطأ في البيانات
    """
    try:
        data = request.get_json()
        claims = g.jwt_claims
        data["doctor_id"] = claims["sub"]
        result = DoctorNotesService.create(data)

        try:
            child = ChildrenRepository.get_by_id(data["child_id"])
            if child:
                parent = child.parent
                doctor = UserRepositories.get_by_id(data["doctor_id"])
                doctor_name = f"{doctor.first_name} {doctor.second_name}" if doctor else "الدكتور"
                child_name = child.first_name

                NotificationRepository.create(
                    user_id=str(parent.id),
                    title="ملاحظة جديدة من الدكتور",
                    body=f"د. {doctor_name} أضاف ملاحظة جديدة لـ {child_name}.",
                    type="doctor_note",
                )

                if parent.device_token:
                    FCMNotificationClient().notify_parent_new_note(
                        parent.device_token, doctor_name, child_name
                    )
        except Exception as notif_err:
            print(f"[Notification] Failed: {notif_err}")

        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@doctor_notes_bp.route("/child/<child_id>", methods=["GET"])
@role_required("Admin", "Doctor", "Parent")
def get_by_child(child_id):
    """
    Get Doctor Notes By Child
    ---
    tags:
      - Doctor Notes
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: child_id
        required: true
        type: string
    responses:
      200:
        description: قائمة الملاحظات
      404:
        description: الطفل غير موجود
    """
    try:
        result = DoctorNotesService.get_by_child(child_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@doctor_notes_bp.route("/child/<child_id>/latest", methods=["GET"])
@role_required("Admin", "Doctor", "Parent")
def get_latest_by_child(child_id):
    """
    Get Latest Doctor Note By Child
    ---
    tags:
      - Doctor Notes
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: child_id
        required: true
        type: string
    responses:
      200:
        description: آخر ملاحظة
      404:
        description: لا توجد ملاحظات
    """
    try:
        result = DoctorNotesService.get_latest_by_child(child_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@doctor_notes_bp.route("/<note_id>", methods=["GET"])
@role_required("Admin", "Doctor", "Parent")
def get_note(note_id):
    """
    Get Doctor Note
    ---
    tags:
      - Doctor Notes
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: note_id
        required: true
        type: string
    responses:
      200:
        description: بيانات الملاحظة
      404:
        description: الملاحظة غير موجودة
    """
    try:
        result = DoctorNotesService.get_by_id(note_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@doctor_notes_bp.route("/<note_id>", methods=["PUT"])
@role_required("Admin", "Doctor")
def update_note(note_id):
    """
    Update Doctor Note
    ---
    tags:
      - Doctor Notes
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: note_id
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            content:
              type: string
              example: "Updated note content"
    responses:
      200:
        description: تم التحديث بنجاح
      404:
        description: الملاحظة غير موجودة
    """
    try:
        data = request.get_json()
        result = DoctorNotesService.update(note_id, data)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@doctor_notes_bp.route("/<note_id>", methods=["DELETE"])
@role_required("Admin", "Doctor")
def delete_note(note_id):
    """
    Delete Doctor Note
    ---
    tags:
      - Doctor Notes
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: note_id
        required: true
        type: string
    responses:
      200:
        description: تم الحذف بنجاح
      404:
        description: الملاحظة غير موجودة
    """
    try:
        result = DoctorNotesService.delete(note_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404