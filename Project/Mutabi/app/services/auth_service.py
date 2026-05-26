from app.repositories.user_repsitories import UserRepositories
from app.utils.helpers import generate_token, generate_temp_password
from app.models.EnumUsers import RoleUser
import re

def validate_password_strength(password: str):
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter.")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must contain at least one number.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("Password must contain at least one special character.")
    

class AuthService:

    @staticmethod
    def login(email: str, password: str) -> dict:
        user = UserRepositories.get_by_email(email)

        if not user:
            raise ValueError("Invalid email or password")


        if not UserRepositories.verify_password(user, password):
            raise ValueError("Invalid email or password")

        token = generate_token(str(user.id), user.role.value, str(user.clinic_id))

        return {"token": token, "role": user.role.value, "active": user.is_active}

    @staticmethod
    def signup(data: dict) -> dict:
        if UserRepositories.email_exists(data["email"]):
            raise ValueError("Email already exists")

        validate_password_strength(data["password"])

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

        if data.get("phone") and UserRepositories.phone_exists(data["phone"]):
            raise ValueError("Phone number already exists")

        user = UserRepositories.create({
            "clinic_id": data["clinic_id"],
            "first_name": data["first_name"],
            "second_name": data["second_name"],
            "email": data["email"],
            "phone": data["phone"],
            "password": temp_password,
            "role": RoleUser.Doctor,
            "specialty": data["specialty"],
            "is_active": False
        })

        return {"temp_password": temp_password, "user_id": str(user.id)}

    @staticmethod
    def create_parent(data: dict) -> dict:
        if UserRepositories.email_exists(data["email"]):
            raise ValueError("Email already exists")

        validate_password_strength(data["password"])

        if data.get("phone") and UserRepositories.phone_exists(data["phone"]):
            raise ValueError("Phone number already exists")

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

        token = generate_token(str(user.id), user.role.value, str(user.clinic_id))

        return {
            "id": str(user.id),
            "first_name": user.first_name,
            "second_name": user.second_name,
            "email": user.email,
            "role": user.role.value,
            "token": token,
        }


    @staticmethod
    def reset_password(user_id: str, old_password: str, new_password: str) -> dict:
        print(f"reset_password called with new_password: {new_password}")
        user = UserRepositories.get_by_id(user_id)

        if not user:
            raise ValueError("User not found")

        if not UserRepositories.verify_password(user, old_password):
            raise ValueError("Old password is incorrect")
        
        print("calling validate_password_strength")
        validate_password_strength(new_password)
        print("validation passed")

        UserRepositories.update(user_id, {"password": new_password})

        return {"message": "Password updated successfully"}
    
    @staticmethod
    def set_password(user_id: str, tempPassword: str, new_password: str):
        user = UserRepositories.get_by_id(user_id)

        if not user:
            raise ValueError("User not found")
        
        if user.is_active:
            raise ValueError("User is activated")
        
        if not UserRepositories.verify_password(user, tempPassword):
            raise ValueError("TempPassword is incorrect")
        
        validate_password_strength(new_password)

        UserRepositories.update(user_id, {"password": new_password, "is_active": True})

        return {"message": "User is activated"}
        

    
