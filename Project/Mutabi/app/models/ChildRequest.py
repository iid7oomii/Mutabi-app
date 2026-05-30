import enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import String, Text, ForeignKey, Date, Enum as SAEnum
from app.models.BaseModel import BaseModel
from datetime import date, datetime

if TYPE_CHECKING:
    from app.models.Clinics import Clinic
    from app.models.User import Users


class ChildRequestStatus(enum.Enum):
    pending  = "pending"
    approved = "approved"
    rejected = "rejected"


class ChildRequest(BaseModel):
    __tablename__ = 'child_requests'

    clinic_id:        Mapped[str]           = mapped_column(ForeignKey('clinics.id'))
    parent_id:        Mapped[str]           = mapped_column(ForeignKey('users.id'))
    first_name:       Mapped[str]           = mapped_column(String(255))
    second_name:      Mapped[str]           = mapped_column(String(255))
    date_of_birth:    Mapped[date]          = mapped_column(Date)
    diagnosis_notes:  Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status:           Mapped[ChildRequestStatus] = mapped_column(
        SAEnum(ChildRequestStatus), default=ChildRequestStatus.pending
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    clinic: Mapped["Clinic"] = relationship(foreign_keys='[ChildRequest.clinic_id]')
    parent: Mapped["Users"]  = relationship(foreign_keys='[ChildRequest.parent_id]')

    @validates('first_name', 'second_name')
    def validate_name(self, key, value):
        if not value or not value.strip():
            raise ValueError(f"{key} must not be empty")
        return value.strip()

    @validates('date_of_birth')
    def validate_dob(self, key, value):
        if value is None:
            raise ValueError("date_of_birth must not be empty")
        if isinstance(value, str):
            value = datetime.strptime(value, '%Y-%m-%d').date()
        if value > date.today():
            raise ValueError("date_of_birth must not be in the future")
        return value
