from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import String, Integer, Boolean, Text, DateTime, func, ForeignKey, event
from app.models.BaseModel import BaseModel
from app.models.EnumUsers import RoleUser
from app.models.EnumRelationship import RelationshipType
import re
import bcrypt


if TYPE_CHECKING:
    from app.models.Clinics import Clinic
    from app.models.Children import Children
    from app.models.Appointments import Appointments


class Users(BaseModel):
    __tablename__ = 'users'

    clinic_id: Mapped[str] = mapped_column(ForeignKey('clinics.id'))
    first_name: Mapped[str] = mapped_column(String(50))
    second_name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    phone: Mapped[str] = mapped_column(String(50))
    password: Mapped[str] = mapped_column(String(255))
    role: Mapped[RoleUser] = mapped_column()
    specialty: Mapped[Optional[str]] = mapped_column(String(255))
    relationship_type: Mapped[Optional[RelationshipType]] = mapped_column()
    custom_relationship: Mapped[Optional[str]] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(default=False)

    clinic: Mapped["Clinic"] = relationship(back_populates="users")
    parent_children: Mapped[List["Children"]] = relationship(back_populates="parent")
    doctor_children: Mapped[List["Children"]] = relationship(back_populates="doctor")
    appointments: Mapped[List["Appointments"]] = relationship(back_populates="doctor")


    @validates('first_name', 'second_name')
    def validate_first_name(self, key, value):
        if not value.strip():
            raise TypeError(f"The {key} must not be empty")
        if not isinstance(value, str):
            raise TypeError(f"The {key} must be string")
        if len(value) >= 50:
            raise TypeError(f"The {key} must be 50 charchter or less")

        return value
    
    ALLOWED_DOMAINS = ['gmail.com', 'Outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com']

    @validates('email')
    def validate_email(self, key, value):
        if not value.strip():
            raise ValueError("The email must not be empty")
        
        if not isinstance(value, str):
            raise TypeError("The email must be string")
        
        value = value.strip().lower()

        if len(value) > 255:
            raise ValueError("The email must be less than 255")

        email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'

        if not re.match(email_pattern, value):
            raise ValueError("Invalid email format")
        
        domain = value.split('@')[1]

        if domain not in self.ALLOWED_DOMAINS:
            raise ValueError(f"Registration is restricted. The domain '{domain}' is not allowed.")

        return value
    

    @validates('phone')
    def validate_phone(self, key, value):
        if not value.strip():
            raise ValueError("The phone number must be not empty")
        
        if not isinstance(value, str):
            raise TypeError("The phone number must be string")
        
        phone_pattern = r'^(05|\+9665|009665)\d{8}$'

        if not re.match(phone_pattern, value):
            raise ValueError("Invalid phone number format. Please enter a valid Saudi mobile number.")
        
        return value
    

    @validates('password')
    def validate_password(self, key, value):
        if not value:
            raise ValueError("Password must not be empty")
        
        if not isinstance(value, str):
            raise TypeError("Password must be String")
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter.")
            
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter.")
            
        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain at least one number.")
            
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError("Password must contain at least one special character.")
        
        password_bytes = value.encode('utf-8')

        salt = bcrypt.gensalt()

        hashed_password_bytes = bcrypt.hashpw(password_bytes, salt)

        return hashed_password_bytes.decode('utf-8')
    

    @validates('role')
    def validate_role(self, key, role_value):
        valid_roles = [e.value for e in RoleUser]
        
        if role_value not in valid_roles and role_value not in RoleUser:
            raise ValueError(f"Invalid role. Allowed roles are: {valid_roles}")
            
        return role_value
    

    @validates('specialty')
    def validate_specialty(self, key, value):
        if not value:
            raise ValueError("Specialty must not be empty")
        
        if not isinstance(value, str):
            raise TypeError("Specialty must be string")
        
        if len(value) > 255:
            raise ValueError("Specialty must be less than 255")
        
        return value


    @validates('relationship_type')
    def validate_relationship(self, key, value):
        if value is None:
            return value

        valid_relationships = [e.value for e in RelationshipType]
        
        if value not in valid_relationships and value not in RelationshipType:
            raise ValueError(f"Invalid relationship type. Allowed: {valid_relationships}")
            
        return value

    @validates('is_active')
    def validate_is_active(self, key, value):
        if value is None:
            raise ValueError("The is_active field cannot be null.")
            
        if not isinstance(value, bool):
            raise TypeError("The is_active field must be a boolean (True or False).")
            
        return value

@event.listens_for(Users, 'before_insert')
@event.listens_for(Users, 'before_update')
def validate_relationship_logic(mapper, connection, target):
    if target.relationship_type == RelationshipType.OTHER or target.relationship_type == "other":
        if not target.custom_relationship or len(target.custom_relationship.strip()) == 0:
            raise ValueError("Custom relationship must be specified when 'OTHER' is selected.")
    else:
        target.custom_relationship = None

