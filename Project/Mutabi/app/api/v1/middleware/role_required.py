from functools import wraps
from flask import jsonify, request as flask_request, g
from flask_jwt_extended import decode_token
import os


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = flask_request.cookies.get('token')
            if not token:
                auth_header = flask_request.headers.get('Authorization', '')
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]

            if not token:
                return jsonify({"error": "Unauthorized"}), 401

            try:
                claims = decode_token(token)
                user_role = claims.get("role", "").lower()
                allowed_roles = [r.lower() for r in roles]
                if user_role not in allowed_roles:
                    return jsonify({"error": "Unauthorized"}), 403
                g.jwt_claims = claims
            except Exception:
                return jsonify({"error": "Invalid token"}), 401

            return fn(*args, **kwargs)
        return wrapper
    return decorator