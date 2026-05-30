from flask import Blueprint, request, jsonify, g
from app.services.therapy_plans_service import TherapyPlansService
from app.api.v1.middleware.role_required import role_required
from app.repositories.children_repository import ChildrenRepository
from app.repositories.user_repsitories import UserRepositories
from app.repositories.notification_repository import NotificationRepository
from app.integrations.notifications import FCMNotificationClient

therapy_plans_bp = Blueprint("therapy_plans", __name__, url_prefix="/therapy-plans")


@therapy_plans_bp.route("/", methods=["POST"])
@role_required("Admin", "Doctor")
def create_plan():
    """
    Create Therapy Plan
    ---
    tags:
      - Therapy Plans
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
            - title
          properties:
            child_id:
              type: string
              example: "uuid-here"
            title:
              type: string
              example: "خطة العلاج الأولى"
            start_date:
              type: string
              example: "2026-05-10"
            end_date:
              type: string
              example: "2026-06-10"
    responses:
      201:
        description: تم إنشاء الخطة بنجاح
      400:
        description: خطأ في البيانات
      403:
        description: غير مصرح
    """
    try:
        data = request.get_json()
        result = TherapyPlansService.create(data)

        try:
            child_id = data.get("child_id")
            if child_id:
                child = ChildrenRepository.get_by_id(child_id)
                if child and child.parent_id:
                    parent = UserRepositories.get_by_id(str(child.parent_id))
                    child_name = f"{child.first_name} {child.second_name}"

                    NotificationRepository.create(
                        user_id=str(parent.id),
                        title="خطة علاجية جديدة",
                        body=f"تم تعيين خطة علاجية جديدة لـ {child_name}.",
                        type="new_plan",
                    )

                    if parent.device_token:
                        FCMNotificationClient().notify_parent_new_plan(
                            parent.device_token, child_name
                        )
        except Exception as notif_err:
            print(f"[Notification] Failed: {notif_err}")

        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@therapy_plans_bp.route("/", methods=["GET"])
@role_required("Admin", "Doctor")
def get_plans():
    """
    Get Therapy Plans
    ---
    tags:
      - Therapy Plans
    consumes:
      - application/json
    security:
      - Bearer: []
    responses:
      200:
        description: قائمة الخطط
      403:
        description: غير مصرح
    """
    try:
        claims = g.jwt_claims
        result = TherapyPlansService.get_all(claims)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@therapy_plans_bp.route("/<plan_id>", methods=["GET"])
@role_required("Admin", "Doctor")
def get_plan(plan_id):
    """
    Get Therapy Plan
    ---
    tags:
      - Therapy Plans
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: plan_id
        required: true
        type: string
    responses:
      200:
        description: بيانات الخطة
      404:
        description: الخطة غير موجودة
    """
    try:
        result = TherapyPlansService.get_by_id(plan_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@therapy_plans_bp.route("/child/<child_id>", methods=["GET"])
@role_required("Admin", "Doctor")
def get_plans_by_child(child_id):
    """
    Get Therapy Plans By Child
    ---
    tags:
      - Therapy Plans
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
        description: قائمة خطط الطفل
      404:
        description: الطفل غير موجود
    """
    try:
        result = TherapyPlansService.get_by_child(child_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@therapy_plans_bp.route("/<plan_id>", methods=["PUT"])
@role_required("Admin", "Doctor")
def update_plan(plan_id):
    """
    Update Therapy Plan
    ---
    tags:
      - Therapy Plans
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: plan_id
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
              example: "خطة محدثة"
            start_date:
              type: string
              example: "2026-05-10"
            end_date:
              type: string
              example: "2026-06-10"
            status:
              type: string
              example: "active"
    responses:
      200:
        description: تم التحديث بنجاح
      404:
        description: الخطة غير موجودة
    """
    try:
        data = request.get_json()
        result = TherapyPlansService.update(plan_id, data)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@therapy_plans_bp.route("/<plan_id>", methods=["DELETE"])
@role_required("Admin", "Doctor")
def delete_plan(plan_id):
    """
    Delete Therapy Plan
    ---
    tags:
      - Therapy Plans
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: plan_id
        required: true
        type: string
    responses:
      200:
        description: تم الحذف بنجاح
      404:
        description: الخطة غير موجودة
    """
    try:
        result = TherapyPlansService.delete(plan_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404