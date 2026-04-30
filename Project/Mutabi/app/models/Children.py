from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, Text, DateTime, func, ForeignKey, Date
from app.models.BaseModel import BaseModel
from datetime import date

if TYPE_CHECKING:
    from app.models.Clinics import Clinic
    from app.models.User import Users
    from app.models.Therapy_plans import TherapyPlans
    from app.models.Appointments import Appointments

class Children(BaseModel):
    __tablename__ = 'children'

    clinic_id: Mapped[str] = mapped_column(ForeignKey('clinics.id'))
    parent_id: Mapped[str] = mapped_column(ForeignKey('users.id'))
    doctor_id: Mapped[str] = mapped_column(ForeignKey('users.id'))
    first_name: Mapped[str] = mapped_column(String(255))
    second_name: Mapped[str] = mapped_column(String(255))
    date_of_birth: Mapped[date] = mapped_column(Date)
    diagnosis_notes: Mapped[str] = mapped_column(Text)


    clinic: Mapped["Clinic"] = relationship(back_populates='children')
    parent: Mapped["Users"] = relationship(foreign_keys='[Children.parent_id]', back_populates='parent_children')
    doctor: Mapped["Users"] = relationship(foreign_keys='[Children.doctor_id]', back_populates='doctor_children')
    therapy_plan: Mapped[List["TherapyPlans"]] = relationship(back_populates='children')
    appointments: Mapped[List["Appointments"]] = relationship(back_populates='children')
