from flask import Flask, request, make_response
from app.config import Config
from app.extensions import db, migrate, jwt

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://mutabi.app",
    "https://www.mutabi.app",
]

def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
    "pool_recycle": 280,
}

    if config:
        app.config.update(config)


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

    from app.routes import api_v1
    app.register_blueprint(api_v1)

    from app.feedback import model as feedback_model
    from app.plan_exercises import model as plan_exercises_model
    from app.therapy_plans import model as therapy_plans_model
    from app.doctor_notes import model as doctor_notes_model
    from app.users import model as users_model
    from app.children import model as children_model
    from app.clinics import model as clinics_model
    from app.appointments import model as appointments_model
    from app.exercises import model as exercises_model
    from app.child_requests import model as child_requests_model
    from app.subscriptions import model as subscriptions_model
    from app.articles import model as articles_model
    from app.notifications import model as notifications_model
    from app.goals import model as goals_model
    from app.goals.reminders import register_goal_reminder_command
    register_goal_reminder_command(app)

    return app
