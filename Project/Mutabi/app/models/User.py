from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import String, Integer, Boolean, Text, DateTime, func, ForeignKey
from app.models.BaseModel import BaseModel
from app.models.EnumUsers import RoleUser

if TYPE_CHECKING:
    from app.models.Clinics import Clinic
    from app.models.Children import Children
    from app.models.Appointments import Appointments


class Users(BaseModel):
    __tablename__ = 'users'

    clinic_id: Mapped[str] = mapped_column(ForeignKey('clinics.id'))
    first_name: Mapped[str] = mapped_column(String(255))
    second_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    phone: Mapped[str] = mapped_column(String(255))
    password: Mapped[str] = mapped_column(String(255))
    role: Mapped[RoleUser] = mapped_column()
    specialty: Mapped[Optional[str]] = mapped_column(String(255))
    relationship_type: Mapped[Optional[str]] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=False)

    clinic: Mapped["Clinic"] = relationship(back_populates="users")
    parent_children: Mapped[List["Children"]] = relationship(back_populates="parent")
    doctor_children: Mapped[List["Children"]] = relationship(back_populates="doctor")
    appointments: Mapped[List["Appointments"]] = relationship(back_populates="doctor")


    @validates('first_name')
    def validate_first_name(self, key, value):
        if isinstance(key)
            raise TypeError("The first name must be string")


