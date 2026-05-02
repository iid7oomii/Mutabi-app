from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    from app.api.v1 import api_v1
    app.register_blueprint(api_v1)

    from app.models import User, Children, Clinics, Appointments, Exercises
    from app.models import Exercises_Feedback, Plan_Exercises, Therapy_plans

    return app
