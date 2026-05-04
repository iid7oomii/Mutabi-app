import secrets
import string
import bcrypt
from flask_jwt_extended import create_access_token
from datetime import timedelta

def generate_temp_password(length: int = 10) -> str:
    chars = string.ascii_letters + string.digits + "!@#$%^&*()"
    return "".join(secrets.choice(chars) for _ in range(length))


def generate_token(user_id: str, role: str, clinic_id: str, expires_in: int = 24) -> str:
    return create_access_token(
        identity=user_id,
        additional_claims={"role": role, "clinic_id": clinic_id},
        expires_delta=timedelta(hours=expires_in)
    )
