from flask import Blueprint
from app.admin.routes import admin_bp
from app.appointments.routes import appointments_bp
from app.articles.routes import articles_bp
from app.auth.routes import auth_bp
from app.children.routes import children_bp
from app.contact.routes import contact_bp
from app.dashboard.routes import dashboard_bp
from app.doctor_notes.routes import doctor_notes_bp
from app.exercises.routes import exercises_bp
from app.feedback.routes import feedback_bp
from app.notifications.routes import notifications_bp
from app.plan_exercises.routes import plan_exercises_bp
from app.subscriptions.routes import subscriptions_bp
from app.therapy_plans.routes import therapy_plans_bp
from app.upload.routes import upload_bp
from app.users.routes import user_bp
from app.clinic_leads.routes import clinic_leads_bp
from app.goals.routes import goals_bp

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
api_v1.register_blueprint(upload_bp)
api_v1.register_blueprint(notifications_bp)
api_v1.register_blueprint(articles_bp)
api_v1.register_blueprint(contact_bp)
api_v1.register_blueprint(subscriptions_bp)
api_v1.register_blueprint(admin_bp)
api_v1.register_blueprint(clinic_leads_bp)
api_v1.register_blueprint(goals_bp)
