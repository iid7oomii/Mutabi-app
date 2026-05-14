from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import Text, ForeignKey, Date
from app.models.BaseModel import BaseModel
from datetime import date

if TYPE_CHECKING:
    from app.models.Children import Children
    from app.models.User import Users


class Appointments(BaseModel):
    __tablename__ = 'appointments'

    child_id: Mapped[str] = mapped_column(ForeignKey('children.id'))
    doctor_id: Mapped[str] = mapped_column(ForeignKey('users.id'))
    appointment: Mapped[date] = mapped_column(Date)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    children: Mapped['Children'] = relationship(back_populates='appointments')
    doctor: Mapped['Users'] = relationship(back_populates='appointments')

    @validates('child_id', 'doctor_id')
    def validate_ids(self, key, value):
        if not value or not value.strip():
            raise ValueError(f"{key} must not be empty")
        return value.strip()

    @validates('appointment')
    def validate_appointment(self, key, value):
        if value is None:
            raise ValueError("appointment date must not be empty")
        if isinstance(value, str):
            from datetime import datetime
            value = datetime.strptime(value, '%Y-%m-%d').date()
        if value < date.today():
            raise ValueError("appointment date must not be in the past")
        return value

    @validates('notes')
    def validate_notes(self, key, value):
        if value is not None and not isinstance(value, str):
            raise TypeError("notes must be a string")
        return value