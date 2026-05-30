from flask import Blueprint, request, jsonify, g
from app import db
from app.services.children_service import ChildrenService
from app.api.v1.middleware.role_required import role_required
from app.repositories.child_request_repository import ChildRequestRepository
from app.models.ChildRequest import ChildRequestStatus
from app.repositories.children_repository import ChildrenRepository
from app.repositories.user_repsitories import UserRepositories


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
@role_required("Admin", "Doctor", "Parent")
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
        claims = g.jwt_claims
        result = ChildrenService.get_by_id(child_id)
        if claims.get("role", "").lower() == "parent" and result.get("parent", {}).get("email") != claims.get("email"):
            child_obj = ChildrenRepository.get_by_id(child_id)
            if not child_obj or str(child_obj.parent_id) != claims["sub"]:
                return jsonify({"error": "Unauthorized"}), 403
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@children_bp.route("/<child_id>", methods=["PUT"])
@role_required("Admin", "Doctor", "Parent")
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
        claims = g.jwt_claims
        data = request.get_json()
        if claims.get("role", "").lower() == "parent":
            child_obj = ChildrenRepository.get_by_id(child_id)
            if not child_obj or str(child_obj.parent_id) != claims["sub"]:
                return jsonify({"error": "Unauthorized"}), 403
            allowed = ["first_name", "second_name", "date_of_birth", "diagnosis_notes"]
            data = {k: v for k, v in data.items() if k in allowed}
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
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    


@children_bp.route("/register-family", methods=["POST"])
@role_required("Admin", "Doctor")
def register_family():
    try:
        data = request.get_json()
        claims = g.jwt_claims
        result = ChildrenService.register_family(data, claims)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@children_bp.route("/request", methods=["POST"])
@role_required("Parent")
def submit_child_request():
    try:
        data    = request.get_json()
        claims  = g.jwt_claims
        required = ["first_name", "second_name", "date_of_birth"]
        for field in required:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        req = ChildRequestRepository.create({
            "clinic_id":       claims["clinic_id"],
            "parent_id":       claims["sub"],
            "first_name":      data["first_name"],
            "second_name":     data["second_name"],
            "date_of_birth":   data["date_of_birth"],
            "diagnosis_notes": data.get("diagnosis_notes"),
        })
        return jsonify(req.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@children_bp.route("/my-requests", methods=["GET"])
@role_required("Parent")
def get_my_requests():
    try:
        claims = g.jwt_claims
        reqs   = ChildRequestRepository.get_by_parent(claims["sub"])
        return jsonify([r.to_dict() for r in reqs]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@children_bp.route("/requests", methods=["GET"])
@role_required("Admin", "Doctor")
def get_child_requests():
    """Admin/Doctor views all child registration requests for the clinic."""
    try:
        claims = g.jwt_claims
        reqs   = ChildRequestRepository.get_by_clinic(claims["clinic_id"])
        result = []
        for r in reqs:
            parent = UserRepositories.get_by_id(r.parent_id)
            result.append({
                **r.to_dict(),
                "parent_name":  f"{parent.first_name} {parent.second_name}" if parent else "—",
                "parent_email": parent.email if parent else "—",
                "parent_phone": parent.phone if parent else "—",
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@children_bp.route("/requests/<request_id>/approve", methods=["PUT"])
@role_required("Admin")
def approve_child_request(request_id):
    try:
        data   = request.get_json()
        claims = g.jwt_claims
        doctor_id = data.get("doctor_id")
        if not doctor_id:
            return jsonify({"error": "doctor_id is required"}), 400
        req = ChildRequestRepository.get_by_id(request_id)
        if not req:
            return jsonify({"error": "Request not found"}), 404
        if req.status != ChildRequestStatus.pending:
            return jsonify({"error": "Request already processed"}), 400
        child_data = {
            "parent_id":       req.parent_id,
            "doctor_id":       doctor_id,
            "first_name":      req.first_name,
            "second_name":     req.second_name,
            "date_of_birth":   str(req.date_of_birth),
            "diagnosis_notes": req.diagnosis_notes,
        }
        result = ChildrenService.create(child_data, claims["clinic_id"])
        ChildRequestRepository.update_status(request_id, ChildRequestStatus.approved)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@children_bp.route("/requests/<request_id>/reject", methods=["PUT"])
@role_required("Admin")
def reject_child_request(request_id):
    try:

        data   = request.get_json() or {}
        req    = ChildRequestRepository.get_by_id(request_id)
        if not req:
            return jsonify({"error": "Request not found"}), 404
        if req.status != ChildRequestStatus.pending:
            return jsonify({"error": "Request already processed"}), 400
        ChildRequestRepository.update_status(
            request_id,
            ChildRequestStatus.rejected,
            rejection_reason=data.get("reason"),
        )
        return jsonify({"message": "Request rejected"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400