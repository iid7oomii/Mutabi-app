from functools import wraps
from flask import request, jsonify, g
import jwt
import os

from app.models.User import Users


def token_required(f):
    """Decorator that validates JWT token and injects current_user into g."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization token is missing'}), 401

        token = auth_header.split(' ')[1]

        try:
            payload = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        user = Users.query.get(payload.get('user_id'))
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 401

        g.current_user = user
        return f(*args, **kwargs)

    return decorated


def role_required(*roles):
    """Decorator that restricts access to specific roles. Use after @token_required."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = g.get('current_user')
            if not user:
                return jsonify({'error': 'Authentication required'}), 401

            user_role = user.role.value if hasattr(user.role, 'value') else user.role
            if user_role not in roles:
                return jsonify({'error': 'Access denied'}), 403

            return f(*args, **kwargs)
        return decorated
    return decorator
