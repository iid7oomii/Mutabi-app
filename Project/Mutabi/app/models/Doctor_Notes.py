from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import String, Text, ForeignKey
from app.models.BaseModel import BaseModel

if TYPE_CHECKING:
    from app.models.User import Users
    from app.models.Children import Children


class DoctorNotes(BaseModel):
    __tablename__ = 'doctor_notes'

    doctor_id: Mapped[str] = mapped_column(ForeignKey('users.id'))
    child_id: Mapped[str] = mapped_column(ForeignKey('children.id'))
    content: Mapped[str] = mapped_column(Text)

    doctor: Mapped['Users'] = relationship(foreign_keys='[DoctorNotes.doctor_id]')
    child: Mapped['Children'] = relationship(back_populates='doctor_notes')

    @validates('doctor_id', 'child_id')
    def validate_ids(self, key, value):
        if not value or not value.strip():
            raise ValueError(f"{key} must not be empty")
        return value.strip()

    @validates('content')
    def validate_content(self, key, value):
        if not value or not value.strip():
            raise ValueError("content must not be empty")
        if not isinstance(value, str):
            raise TypeError("content must be a string")
        return value.strip()