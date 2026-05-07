from flask import Blueprint, jsonify, request
import jwt
import os
from app.services.dashboard_service import DashboardService
from app.api.v1.middleware.role_required import role_required

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


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