from typing import Optional, List
from app.models.User import Users
from app.models.EnumUsers import RoleUser
from app import db
import bcrypt


class UserRepositories:

    @staticmethod
    def get_all() -> List[Users]:
        return db.session.query(Users).all()

    @staticmethod
    def get_by_id(user_id: str) -> Optional[Users]:
        return db.session.get(Users, user_id)

    @staticmethod
    def get_by_email(email: str) -> Optional[Users]:
        return db.session.query(Users).filter_by(email=email.strip().lower()).first()

    @staticmethod
    def get_by_role(role: RoleUser) -> List[Users]:
        return db.session.query(Users).filter_by(role=role).all()

    @staticmethod
    def get_by_clinic(clinic_id: str) -> List[Users]:
        return db.session.query(Users).filter_by(clinic_id=clinic_id).all()

    @staticmethod
    def get_active_users() -> List[Users]:
        return db.session.query(Users).filter_by(is_active=True).all()

    @staticmethod
    def get_doctors_by_clinic(clinic_id: str) -> List[Users]:
        return (
            db.session.query(Users)
            .filter_by(clinic_id=clinic_id, role=RoleUser.Doctor, is_active=True)
            .all()
        )

    @staticmethod
    def get_parents_by_clinic(clinic_id: str) -> List[Users]:
        return (
            db.session.query(Users)
            .filter_by(clinic_id=clinic_id, role=RoleUser.Parent, is_active=True)
            .all()
        )

    @staticmethod
    def create(data: dict) -> Users:
        user = Users(**data)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def update(user_id: str, data: dict) -> Optional[Users]:
        user = db.session.get(Users, user_id)
        if not user:
            return None
        for key, value in data.items():
            setattr(user, key, value)
        db.session.commit()
        return user

    @staticmethod
    def delete(user_id: str) -> bool:
        user = db.session.get(Users, user_id)
        if not user:
            return False
        db.session.delete(user)
        db.session.commit()
        return True

    @staticmethod
    def activate(user_id: str) -> Optional[Users]:
        user = db.session.get(Users, user_id)
        if not user:
            return None
        user.is_active = True
        db.session.commit()
        return user

    @staticmethod
    def deactivate(user_id: str) -> Optional[Users]:
        user = db.session.get(Users, user_id)
        if not user:
            return None
        user.is_active = False
        db.session.commit()
        return user

    @staticmethod
    def verify_password(user: Users, plain_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            user.password.encode('utf-8')
        )

    @staticmethod
    def email_exists(email: str) -> bool:
        return (
            db.session.query(Users)
            .filter_by(email=email.strip().lower())
            .first() is not None
        )
