from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
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
    notes: Mapped[str] = mapped_column(Text)

    children: Mapped['Children'] = relationship(back_populates='appointments')
    doctor: Mapped['Users'] = relationship(back_populates='appointments')
