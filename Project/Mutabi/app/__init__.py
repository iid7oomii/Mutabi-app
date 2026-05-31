from flask import Flask, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://mutabi.app",
    "https://www.mutabi.app",
]

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    app.url_map.strict_slashes = False

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            origin = request.headers.get("Origin", "")
            response = make_response()
            response.headers["Access-Control-Allow-Origin"] = origin if origin in ALLOWED_ORIGINS else ""
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Max-Age"] = "86400"
            return response

    @app.after_request
    def add_cors(response):
        origin = request.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    from app.api.v1 import api_v1
    app.register_blueprint(api_v1)

    from app.models import Exercises_Feedback, Plan_Exercises, Therapy_plans, Doctor_Notes, User, Children, Clinics, Appointments, Exercises, ChildRequest

    return app
