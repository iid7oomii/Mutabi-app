from flask import Blueprint, request, jsonify
from sqlalchemy import or_
import bcrypt
import jwt
import os
import datetime

from app import db
from app.models.User import Users

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login for all user types (Admin, Doctor, Parent).

    Body (JSON):
        { "email": "...", "password": "..." }
      OR
        { "phone": "...", "password": "..." }

    Returns:
        { "token": "...", "user": { id, role, first_name, second_name } }
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    password = data.get('password')
    email = data.get('email')
    phone = data.get('phone')

    if not password:
        return jsonify({'error': 'Password is required'}), 400

    if not email and not phone:
        return jsonify({'error': 'Email or phone is required'}), 400

    user = Users.query.filter(
        or_(Users.email == email, Users.phone == phone)
    ).first()

    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is not active'}), 403

    password_match = bcrypt.checkpw(
        password.encode('utf-8'),
        user.password.encode('utf-8')
    )

    if not password_match:
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode(
        {
            'user_id': user.id,
            'role': user.role.value,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        },
        os.getenv('SECRET_KEY'),
        algorithm='HS256'
    )

    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'role': user.role.value,
            'first_name': user.first_name,
            'second_name': user.second_name,
            'email': user.email,
        }
    }), 200
