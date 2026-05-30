from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import Text, ForeignKey, DateTime
from app.models.BaseModel import BaseModel
from datetime import datetime

if TYPE_CHECKING:
    from app.models.Children import Children
    from app.models.User import Users


class Appointments(BaseModel):
    __tablename__ = 'appointments'

    child_id: Mapped[str] = mapped_column(ForeignKey('children.id'))
    doctor_id: Mapped[str] = mapped_column(ForeignKey('users.id'))
    appointment: Mapped[datetime] = mapped_column(DateTime)
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
            for fmt in ('%Y-%m-%dT%H:%M', '%Y-%m-%d %H:%M', '%Y-%m-%d'):
                try:
                    value = datetime.strptime(value, fmt)
                    break
                except ValueError:
                    continue
            else:
                raise ValueError("Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM")
        return value

    @validates('notes')
    def validate_notes(self, key, value):
        if value is not None and not isinstance(value, str):
            raise TypeError("notes must be a string")
        return value