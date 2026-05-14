from flask import Blueprint
from .auth.auth_routes import auth_bp
from .users.user_routes import user_bp
from app.api.v1.dashboard.dashboard_routes import dashboard_bp
from app.api.v1.children.children_routes import children_bp
from app.api.v1.therapy_plans.therapy_plans_routes import therapy_plans_bp
from app.api.v1.exercises.exercises_routes import exercises_bp
from app.api.v1.plan_exercises.plan_exercises_routes import plan_exercises_bp
from app.api.v1.feedback.feedback_routes import feedback_bp
from app.api.v1.doctor_notes.doctor_notes_routes import doctor_notes_bp
from app.api.v1.appointments.appointments_routes import appointments_bp

api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

api_v1.register_blueprint(auth_bp)
api_v1.register_blueprint(user_bp)
api_v1.register_blueprint(dashboard_bp)
api_v1.register_blueprint(children_bp)
api_v1.register_blueprint(therapy_plans_bp)
api_v1.register_blueprint(exercises_bp)
api_v1.register_blueprint(plan_exercises_bp)
api_v1.register_blueprint(feedback_bp)
api_v1.register_blueprint(doctor_notes_bp)
api_v1.register_blueprint(appointments_bp)