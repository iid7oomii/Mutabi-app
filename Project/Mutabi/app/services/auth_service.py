from app.repositories.user_repsitories import UserRepositories
from app.utils.helpers import generate_token, generate_temp_password
from app.models.EnumUsers import RoleUser


class AuthService:

    @staticmethod
    def login(email: str, password: str) -> dict:
        user = UserRepositories.get_by_email(email)

        if not user:
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("Account is not active")

        if not UserRepositories.verify_password(user, password):
            raise ValueError("Invalid email or password")

        token = generate_token(str(user.id), user.role.value, str(user.clinic_id))

        return {"token": token, "role": user.role.value}

    @staticmethod
    def signup(data: dict) -> dict:
        if UserRepositories.email_exists(data["email"]):
            raise ValueError("Email already exists")

        user = UserRepositories.create({
            "clinic_id": data["clinic_id"],
            "first_name": data["first_name"],
            "second_name": data["second_name"],
            "email": data["email"],
            "phone": data["phone"],
            "password": data["password"],
            "role": RoleUser.Admin,
            "is_active": True
        })

        token = generate_token(str(user.id), user.role.value, str(user.clinic_id))

        return {"token": token, "role": user.role.value}

    @staticmethod
    def create_doctor(data: dict) -> dict:
        if UserRepositories.email_exists(data["email"]):
            raise ValueError("Email already exists")

        temp_password = generate_temp_password()

        user = UserRepositories.create({
            "clinic_id": data["clinic_id"],
            "first_name": data["first_name"],
            "second_name": data["second_name"],
            "email": data["email"],
            "phone": data["phone"],
            "password": temp_password,
            "role": RoleUser.Doctor,
            "specialty": data["specialty"],
            "is_active": True
        })

        return {"temp_password": temp_password, "user_id": str(user.id)}

    @staticmethod
    def create_parent(data: dict) -> dict:
        if UserRepositories.email_exists(data["email"]):
            raise ValueError("Email already exists")

        user = UserRepositories.create({
            "clinic_id": data["clinic_id"],
            "first_name": data["first_name"],
            "second_name": data["second_name"],
            "email": data["email"],
            "phone": data["phone"],
            "password": data["password"],
            "role": RoleUser.Parent,
            "relationship_type": data["relationship_type"],
            "is_active": True
        })

        token = generate_token(str(user.id), user.role.value, str(user.clinic_id), 24)

        return {"token": token, "role": user.role.value}

    @staticmethod
    def reset_password(user_id: str, old_password: str, new_password: str) -> dict:
        user = UserRepositories.get_by_id(user_id)

        if not user:
            raise ValueError("User not found")

        if not UserRepositories.verify_password(user, old_password):
            raise ValueError("Old password is incorrect")

        UserRepositories.update(user_id, {"password": new_password})

        return {"message": "Password updated successfully"}