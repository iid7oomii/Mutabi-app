
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt
from app.facade.user_facade import UserFacade
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
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
                example: "uuid-here"
              first_name:
                type: string
                example: "محمد"
              second_name:
                type: string
                example: "العمري"
              email:
                type: string
                example: "admin@gmail.com"
              role:
                type: string
                example: "admin"
      403:
        description: غير مصرح
    """
    claims = get_jwt()
    clinic_id = claims["clinic_id"]
    role = request.args.get("role")
    result = UserFacade.get_all(clinic_id, role)
    return jsonify([u.to_dict(exclude=["password"]) for u in result]), 200


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
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
                example: "uuid-here"
              first_name:
                type: string
                example: "سارة"
              email:
                type: string
                example: "parent@gmail.com"
      403:
        description: غير مصرح
    """
    claims = get_jwt()
    clinic_id = claims["clinic_id"]
    result = UserFacade.get_parents(clinic_id)
    return jsonify([u.to_dict(exclude=["password"]) for u in result]), 200