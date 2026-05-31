from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.config import Config
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://mutabi.app"
      ])
    from app.api.v1 import api_v1
    app.register_blueprint(api_v1)

    from app.models import Exercises_Feedback, Plan_Exercises, Therapy_plans, Doctor_Notes,  User, Children, Clinics, Appointments, Exercises, ChildRequest

    return app
