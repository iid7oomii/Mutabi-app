from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import String, Text, ForeignKey, Date
from app.models.BaseModel import BaseModel
from datetime import date, datetime

if TYPE_CHECKING:
    from app.models.Clinics import Clinic
    from app.models.User import Users
    from app.models.Therapy_plans import TherapyPlans
    from app.models.Appointments import Appointments
    from app.models.Doctor_Notes import DoctorNotes

class Children(BaseModel):
    __tablename__ = 'children'

    clinic_id: Mapped[str] = mapped_column(ForeignKey('clinics.id'))
    parent_id: Mapped[str] = mapped_column(ForeignKey('users.id'))
    doctor_id: Mapped[str] = mapped_column(ForeignKey('users.id'))
    first_name: Mapped[str] = mapped_column(String(255))
    second_name: Mapped[str] = mapped_column(String(255))
    date_of_birth: Mapped[date] = mapped_column(Date)
    diagnosis_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    clinic: Mapped["Clinic"] = relationship(back_populates='children')
    parent: Mapped["Users"] = relationship(foreign_keys='[Children.parent_id]', back_populates='parent_children')
    doctor: Mapped["Users"] = relationship(foreign_keys='[Children.doctor_id]', back_populates='doctor_children')
    therapy_plan: Mapped[List["TherapyPlans"]] = relationship(back_populates='children')
    appointments: Mapped[List["Appointments"]] = relationship(back_populates='children')
    doctor_notes: Mapped[List['DoctorNotes']] = relationship(back_populates='child')
    

    @validates('first_name', 'second_name')
    def validate_name(self, key, value):
        if not value or not value.strip():
            raise ValueError(f"{key} must not be empty")
        if not isinstance(value, str):
            raise TypeError(f"{key} must be a string")
        if len(value) > 50:
            raise ValueError(f"{key} must be 50 characters or less")
        return value.strip()

    @validates('date_of_birth')
    def validate_date_of_birth(self, key, value):
        if value is None:
            raise ValueError("date_of_birth must not be empty")
        if isinstance(value, str):
            value = datetime.strptime(value, '%Y-%m-%d').date()
        if value > date.today():
            raise ValueError("date_of_birth must not be in the future")
        return value

    @validates('parent_id', 'doctor_id', 'clinic_id')
    def validate_ids(self, key, value):
        if not value or not value.strip():
            raise ValueError(f"{key} must not be empty")
        return value.strip()

    @validates('diagnosis_notes')
    def validate_diagnosis_notes(self, key, value):
        if value is not None and not isinstance(value, str):
            raise TypeError("diagnosis_notes must be a string")
        return value