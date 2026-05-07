from flask import Blueprint, request, jsonify, g
from app.facade.user_facade import UserFacade
from app.repositories.user_repsitories import UserRepositories
from app.api.v1.middleware.role_required import role_required

user_bp = Blueprint("users", __name__, url_prefix="/users")


@user_bp.route("/", methods=["GET"])
@role_required("Admin")
def get_users():
    """
    Get Users
    ---
    tags:
      - Users
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: query
        name: role
        type: string
        required: false
        description: فلتر بالدور (Doctor, Parent, Admin)
        example: "Doctor"
    responses:
      200:
        description: قائمة المستخدمين
      403:
        description: غير مصرح
    """
    try:
        claims = g.jwt_claims
        clinic_id = claims["clinic_id"]
        role = request.args.get("role")
        result = UserFacade.get_all(clinic_id, role)
        return jsonify([u.to_dict(exclude=["password"]) for u in result]), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@user_bp.route("/parents", methods=["GET"])
@role_required("Admin", "Doctor")
def get_parents():
    """
    Get Parents
    ---
    tags:
      - Users
    consumes:
      - application/json
    security:
      - Bearer: []
    responses:
      200:
        description: قائمة أولياء الأمور
      403:
        description: غير مصرح
    """
    try:
        claims = g.jwt_claims
        clinic_id = claims["clinic_id"]
        result = UserFacade.get_parents(clinic_id)
        return jsonify([u.to_dict(exclude=["password"]) for u in result]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@user_bp.route("/<user_id>", methods=["GET"])
@role_required("Admin")
def get_user(user_id):
    """
    Get User
    ---
    tags:
      - Users
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        required: true
        type: string
    responses:
      200:
        description: بيانات المستخدم
      404:
        description: المستخدم غير موجود
    """
    try:
        user = UserRepositories.get_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user.to_dict(exclude=["password"])), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@user_bp.route("/<user_id>", methods=["PUT"])
@role_required("Admin")
def update_user(user_id):
    """
    Update User
    ---
    tags:
      - Users
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
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
              example: "محمد"
            second_name:
              type: string
              example: "العمري"
            phone:
              type: string
              example: "0512345678"
            is_active:
              type: boolean
              example: true
    responses:
      200:
        description: تم التحديث بنجاح
      404:
        description: المستخدم غير موجود
    """
    try:
        data = request.get_json()
        user = UserRepositories.update(user_id, data)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user.to_dict(exclude=["password"])), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@user_bp.route("/<user_id>", methods=["DELETE"])
@role_required("Admin")
def delete_user(user_id):
    """
    Delete User
    ---
    tags:
      - Users
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        required: true
        type: string
    responses:
      200:
        description: تم الحذف بنجاح
      404:
        description: المستخدم غير موجود
    """
    try:
        deleted = UserRepositories.delete(user_id)
        if not deleted:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@user_bp.route("/me", methods=["PUT"])
@role_required("Admin", "Doctor")
def update_me():
    """
    Update My Profile
    ---
    tags:
      - Users
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
          properties:
            first_name:
              type: string
              example: "محمد"
            second_name:
              type: string
              example: "العمري"
            phone:
              type: string
              example: "0512345678"
    responses:
      200:
        description: تم التحديث بنجاح
      400:
        description: خطأ في البيانات
    """
    try:
        from flask_jwt_extended import get_jwt_identity
        user_id = get_jwt_identity()
        data = request.get_json()

        allowed = ["first_name", "second_name", "phone"]
        filtered_data = {k: v for k, v in data.items() if k in allowed}

        user = UserRepositories.update(user_id, filtered_data)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user.to_dict(exclude=["password"])), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400