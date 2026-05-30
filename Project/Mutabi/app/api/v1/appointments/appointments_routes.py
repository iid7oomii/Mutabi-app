from flask import Blueprint, request, jsonify, g
from app.services.appointments_service import AppointmentsService
from app.api.v1.middleware.role_required import role_required

appointments_bp = Blueprint("appointments", __name__, url_prefix="/appointments")


@appointments_bp.route("/", methods=["POST"])
@role_required("Admin", "Doctor")
def create_appointment():
    """
    Create Appointment
    ---
    tags:
      - Appointments
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
            - appointment
          properties:
            child_id:
              type: string
              example: "uuid-here"
            appointment:
              type: string
              example: "2026-05-20"
            notes:
              type: string
              example: "ملاحظات الموعد"
    responses:
      201:
        description: تم إنشاء الموعد بنجاح
      400:
        description: خطأ في البيانات
    """
    try:
        data = request.get_json()
        claims = g.jwt_claims
        data["doctor_id"] = claims["sub"]
        result = AppointmentsService.create(data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@appointments_bp.route("/child/<child_id>", methods=["GET"])
@role_required("Admin", "Doctor", "Parent")
def get_by_child(child_id):
    """
    Get Appointments By Child
    ---
    tags:
      - Appointments
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
        description: قائمة المواعيد
      404:
        description: الطفل غير موجود
    """
    try:
        result = AppointmentsService.get_by_child(child_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@appointments_bp.route("/child/<child_id>/upcoming", methods=["GET"])
@role_required("Admin", "Doctor", "Parent")
def get_upcoming(child_id):
    """
    Get Upcoming Appointment By Child
    ---
    tags:
      - Appointments
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
        description: الموعد القادم
      404:
        description: لا يوجد موعد قادم
    """
    try:
        result = AppointmentsService.get_upcoming_by_child(child_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@appointments_bp.route("/doctor", methods=["GET"])
@role_required("Admin", "Doctor")
def get_by_doctor():
    """
    Get Appointments By Doctor
    ---
    tags:
      - Appointments
    consumes:
      - application/json
    security:
      - Bearer: []
    responses:
      200:
        description: قائمة مواعيد الدكتور
    """
    try:
        claims = g.jwt_claims
        doctor_id = claims["sub"]
        result = AppointmentsService.get_by_doctor(doctor_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@appointments_bp.route("/<appointment_id>", methods=["GET"])
@role_required("Admin", "Doctor", "Parent")
def get_appointment(appointment_id):
    """
    Get Appointment
    ---
    tags:
      - Appointments
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: appointment_id
        required: true
        type: string
    responses:
      200:
        description: بيانات الموعد
      404:
        description: الموعد غير موجود
    """
    try:
        result = AppointmentsService.get_by_id(appointment_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@appointments_bp.route("/<appointment_id>", methods=["PUT"])
@role_required("Admin", "Doctor")
def update_appointment(appointment_id):
    """
    Update Appointment
    ---
    tags:
      - Appointments
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: appointment_id
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            appointment:
              type: string
              example: "2026-05-25"
            notes:
              type: string
              example: "ملاحظات محدثة"
    responses:
      200:
        description: تم التحديث بنجاح
      404:
        description: الموعد غير موجود
    """
    try:
        data = request.get_json()
        result = AppointmentsService.update(appointment_id, data)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@appointments_bp.route("/<appointment_id>", methods=["DELETE"])
@role_required("Admin", "Doctor")
def delete_appointment(appointment_id):
    """
    Delete Appointment
    ---
    tags:
      - Appointments
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: appointment_id
        required: true
        type: string
    responses:
      200:
        description: تم الحذف بنجاح
      404:
        description: الموعد غير موجود
    """
    try:
        result = AppointmentsService.delete(appointment_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404