# api/v1/children/children_routes.py
from flask import Blueprint, request, jsonify
from flask import Blueprint, request, jsonify, g
from app.services.children_service import ChildrenService
from app.api.v1.middleware.role_required import role_required

children_bp = Blueprint("children", __name__, url_prefix="/children")


@children_bp.route("/", methods=["POST"])
@role_required("Admin", "Doctor")
def create_child():
    """
    Create Child
    ---
    tags:
      - Children
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
            - first_name
            - second_name
            - date_of_birth
            - parent_id
            - doctor_id
          properties:
            first_name:
              type: string
              example: "أحمد"
            second_name:
              type: string
              example: "العمري"
            date_of_birth:
              type: string
              example: "2018-05-10"
            parent_id:
              type: string
              example: "uuid-here"
            doctor_id:
              type: string
              example: "uuid-here"
            diagnosis_notes:
              type: string
              example: "ملاحظات التشخيص"
    responses:
      201:
        description: تم إنشاء الطفل بنجاح
      400:
        description: خطأ في البيانات
    """
    try:
        data = request.get_json()
        claims = g.jwt_claims
        result = ChildrenService.create(data, claims["clinic_id"])
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@children_bp.route("/", methods=["GET"])
@role_required("Admin", "Doctor")
def get_children():
    """
    Get Children
    ---
    tags:
      - Children
    consumes:
      - application/json
    security:
      - Bearer: []
    responses:
      200:
        description: قائمة الأطفال
    """
    try:
        claims = g.jwt_claims
        result = ChildrenService.get_all(claims)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@children_bp.route("/<child_id>", methods=["GET"])
@role_required("Admin", "Doctor")
def get_child(child_id):
    """
    Get Child
    ---
    tags:
      - Children
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
        description: بيانات الطفل
      404:
        description: الطفل غير موجود
    """
    try:
        result = ChildrenService.get_by_id(child_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@children_bp.route("/<child_id>", methods=["PUT"])
@role_required("Admin", "Doctor")
def update_child(child_id):
    """
    Update Child
    ---
    tags:
      - Children
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: child_id
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            first_name:
              type: string
              example: "أحمد"
            second_name:
              type: string
              example: "العمري"
            date_of_birth:
              type: string
              example: "2018-05-10"
            diagnosis_notes:
              type: string
              example: "ملاحظات محدثة"
    responses:
      200:
        description: تم التحديث بنجاح
      404:
        description: الطفل غير موجود
    """
    try:
        data = request.get_json()
        result = ChildrenService.update(child_id, data)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@children_bp.route("/<child_id>", methods=["DELETE"])
@role_required("Admin", "Doctor")
def delete_child(child_id):
    """
    Delete Child
    ---
    tags:
      - Children
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
        description: تم الحذف بنجاح
      404:
        description: الطفل غير موجود
    """
    try:
        result = ChildrenService.delete(child_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404