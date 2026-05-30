from __future__ import annotations
from typing import Optional, List, Type, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, Text, DateTime, func, ForeignKey
from app.models.BaseModel import BaseModel

if TYPE_CHECKING:
    from app.models.User import Users
    from app.models.Children import Children

class Clinic(BaseModel):
    __tablename__ = 'clinics'

    name: Mapped[str] = mapped_column(String(255))
    logo_url: Mapped[str] = mapped_column(String(255))
    address: Mapped[Optional[str]] = mapped_column(String(255))
    contact_phone: Mapped[str] = mapped_column(String(255))

    users: Mapped[list["Users"]] = relationship(back_populates='clinic')
    children: Mapped[list['Children']] = relationship(back_populates='clinic')

