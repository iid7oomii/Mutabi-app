# facades/auth_facade.py
from app.services.auth_service import AuthService
from app.services.clinic_service import ClinicService


class AuthFacade:

    @staticmethod
    def admin_signup(data: dict) -> dict:
        clinic = ClinicService.create({
            "name": data["clinic_name"],
            "logo_url": data["logo_url"],
            "contact_phone": data["contact_phone"],
            "address": data.get("address")
        })

        result = AuthService.signup({
            "clinic_id": str(clinic.id),
            "first_name": data["first_name"],
            "second_name": data["second_name"],
            "email": data["email"],
            "phone": data["phone"],
            "password": data["password"],
        })

        return result

    @staticmethod
    def parent_signup(data: dict) -> dict:
        return AuthService.create_parent(data)

    @staticmethod
    def login(email: str, password: str) -> dict:
        return AuthService.login(email, password)

    @staticmethod
    def create_doctor(data: dict) -> dict:
        return AuthService.create_doctor(data)

    @staticmethod
    def create_parent(data: dict) -> dict:
        return AuthService.create_parent(data)

    @staticmethod
    def reset_password(user_id: str, old_password: str, new_password: str) -> dict:
        return AuthService.reset_password(user_id, old_password, new_password)