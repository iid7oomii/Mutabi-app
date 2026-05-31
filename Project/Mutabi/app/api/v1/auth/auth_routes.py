from flask import Blueprint, request, jsonify, make_response, g
from flask_jwt_extended import get_jwt_identity, decode_token, jwt_required
import traceback
from app.facade.auth_facade import AuthFacade
from app.api.v1.middleware.role_required import role_required
from app.repositories.user_repsitories import UserRepositories
from app.repositories.clinic_repository import ClinicRepository

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/signup", methods=["POST"])
def admin_signup():
    """
    Admin Signup
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - clinic_name
            - logo_url
            - contact_phone
            - first_name
            - second_name
            - email
            - phone
            - password
          properties:
            clinic_name:
              type: string
              example: "عيادة الأمل"
            logo_url:
              type: string
              example: "https://example.com/logo.png"
            contact_phone:
              type: string
              example: "0512345678"
            address:
              type: string
              example: "الرياض، حي النزهة"
            first_name:
              type: string
              example: "محمد"
            second_name:
              type: string
              example: "العمري"
            email:
              type: string
              example: "admin@gmail.com"
            phone:
              type: string
              example: "0512345678"
            password:
              type: string
              example: "Admin@1234"
    responses:
      201:
        description: تم إنشاء الحساب بنجاح
        schema:
          type: object
          properties:
            token:
              type: string
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            role:
              type: string
              example: "admin"
      400:
        description: خطأ في البيانات
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Email already exists"
    """
    try:
        data = request.get_json()
        result = AuthFacade.admin_signup(data)

        response = make_response(jsonify({"role": result["role"]}), 201)
        response.set_cookie(
            'token',
            result["token"],
            httponly=True,
            secure=True,
            samesite='None',
            max_age=86400
        )
        return response
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: "admin@gmail.com"
            password:
              type: string
              example: "Admin@1234"
    responses:
      200:
        description: تم تسجيل الدخول بنجاح
        schema:
          type: object
          properties:
            token:
              type: string
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            role:
              type: string
              example: "admin"
      401:
        description: بيانات خاطئة
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Invalid email or password"
    """
    try:
        data = request.get_json()
        result = AuthFacade.login(data["email"], data["password"])
        response = make_response(jsonify({
            "role": result["role"],
            "token": result["token"],
            "active": result["active"]
        }), 200)
        response.set_cookie(
            'token',
            result["token"],
            httponly=True,
            secure=True,
            samesite='None',
            max_age=86400 
        )
        return response
    except ValueError as e:
        return jsonify({"error": str(e)}), 401


@auth_bp.route("/doctor", methods=["POST"])
@role_required("Admin")
def create_doctor():
    """
    Create Doctor
    ---
    tags:
      - Auth
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
            - email
            - phone
            - specialty
          properties:
            first_name:
              type: string
              example: "أحمد"
            second_name:
              type: string
              example: "الغامدي"
            email:
              type: string
              example: "doctor@gmail.com"
            phone:
              type: string
              example: "0512345678"
            specialty:
              type: string
              example: "أطفال"
    responses:
      201:
        description: تم إنشاء حساب الدكتور بنجاح
        schema:
          type: object
          properties:
            temp_password:
              type: string
              example: "Ax3@kP9z"
            user_id:
              type: string
              example: "uuid-here"
      400:
        description: خطأ في البيانات
      403:
        description: غير مصرح
    """
    try:
        data = request.get_json()
        claims = g.jwt_claims
        data["clinic_id"] = claims["clinic_id"]
        result = AuthFacade.create_doctor(data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/parent", methods=["POST"])
@role_required("Admin", "Doctor")
def create_parent():
    """
    Create Parent
    ---
    tags:
      - Auth
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
            - email
            - phone
            - password
            - relationship_type
            - clinic_id
          properties:
            first_name:
              type: string
              example: "سارة"
            second_name:
              type: string
              example: "المطيري"
            email:
              type: string
              example: "parent@gmail.com"
            phone:
              type: string
              example: "0512345678"
            password:
              type: string
              example: "Parent@1234"
            relationship_type:
              type: string
              example: "mother"
            clinic_id:
              type: string
              example: "uuid-here"
    responses:
      201:
        description: تم إنشاء حساب ولي الأمر بنجاح
      400:
        description: خطأ في البيانات
      403:
        description: غير مصرح
    """
    try:
        data = request.get_json()
        data["clinic_id"] = g.jwt_claims["clinic_id"]
        result = AuthFacade.create_parent(data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/parent/signup", methods=["POST"])
def parent_signup():
    """
    Parent Signup
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - first_name
            - second_name
            - email
            - phone
            - password
            - relationship_type
            - clinic_id
          properties:
            first_name:
              type: string
              example: "سارة"
            second_name:
              type: string
              example: "المطيري"
            email:
              type: string
              example: "parent@gmail.com"
            phone:
              type: string
              example: "0512345678"
            password:
              type: string
              example: "Parent@1234"
            relationship_type:
              type: string
              example: "mother"
            clinic_id:
              type: string
              example: "uuid-here"
    responses:
      201:
        description: تم إنشاء الحساب بنجاح
      400:
        description: خطأ في البيانات
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Email already exists"
    """
    try:
        data = request.get_json()
        result = AuthFacade.parent_signup(data)

        response = make_response(jsonify({"role": result["role"], "token": result["token"]}), 201)
        response.set_cookie(
            'token',
            result["token"],
            httponly=True,
            secure=True,
            samesite='None',
            max_age=86400
        )
        return response
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500


@auth_bp.route("/reset-password", methods=["PUT"])
@role_required("Admin", "Doctor", "Parent")
def reset_password():
    """
    Reset Password
    ---
    tags:
      - Auth
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
            - old_password
            - new_password
          properties:
            old_password:
              type: string
              example: "OldPass@1234"
            new_password:
              type: string
              example: "NewPass@1234"
    responses:
      200:
        description: تم تغيير كلمة المرور بنجاح
      400:
        description: خطأ في البيانات
      403:
        description: غير مصرح
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        result = AuthFacade.reset_password(user_id, data["old_password"], data["new_password"])
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    

@auth_bp.route("/set_password", methods=["PUT"])
@role_required("Doctor", "Parent")
def set_password():
    try:
        user_id = g.jwt_claims["sub"]
        data = request.get_json()
        result = AuthFacade.set_password(user_id, data["tempPassword"], data["newPassword"])
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401
    

@auth_bp.route("/me", methods=["GET"])
def me():
    try:
        token = request.cookies.get('token')
        if not token:
            return jsonify({"error": "Unauthorized"}), 401
        claims = decode_token(token)

        user = UserRepositories.get_by_id(claims["sub"])
        if not user:
            return jsonify({"error": "User not found"}), 404

        clinic = ClinicRepository.get_by_id(claims["clinic_id"])

        return jsonify({
            "user_id": claims["sub"],
            "role": claims["role"],
            "clinic_id": claims["clinic_id"],
            "first_name": user.first_name,
            "second_name": user.second_name,
            "phone": user.phone,
            "specialty": user.specialty,
            "active": user.is_active,
            "profile_picture_url": user.profile_picture_url,
            "clinic_logo_url": clinic.logo_url if clinic else None,
            "clinic_name": clinic.name if clinic else None,
            "clinic_contact_phone": clinic.contact_phone if clinic else None,
            "clinic_address": clinic.address if clinic else None,
        }), 200
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401
    

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get("email", "").strip()
        if not email:
            return jsonify({"error": "البريد الإلكتروني مطلوب"}), 400
        result = AuthFacade.forgot_password(email)
        return jsonify(result), 200
    except Exception as e:
        print(f"[forgot_password ERROR] {e}")
        traceback.print_exc()
        return jsonify({"message": "إذا كان البريد الإلكتروني مسجلاً، سيصلك رابط إعادة التعيين قريباً"}), 200


@auth_bp.route("/reset-password-confirm", methods=["POST"])
def reset_password_confirm():
    try:
        data = request.get_json()
        token = data.get("token", "").strip()
        new_password = data.get("new_password", "")
        if not token or not new_password:
            return jsonify({"error": "البيانات ناقصة"}), 400
        result = AuthFacade.reset_password_by_token(token, new_password)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"message": "Logged out"}), 200)
    response.delete_cookie('token', path='/')
    response.delete_cookie('role', path='/')
    return response