from flask import Blueprint
from .auth.auth_routes import auth_bp
from .users.user_routes import user_bp

api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

api_v1.register_blueprint(auth_bp)
api_v1.register_blueprint(user_bp)