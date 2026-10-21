from __future__ import annotations
from typing import Optional, List, Type, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, Text, DateTime, func, ForeignKey
from app.common.base_model import BaseModel

if TYPE_CHECKING:
    from app.users.model import Users
    from app.children.model import Children
    from app.subscriptions.model import Subscription

class Clinic(BaseModel):
    __tablename__ = 'clinics'

    name: Mapped[str] = mapped_column(String(255))
    logo_url: Mapped[str] = mapped_column(String(255))
    address: Mapped[Optional[str]] = mapped_column(String(255))
    contact_phone: Mapped[str] = mapped_column(String(255))

    users: Mapped[list["Users"]] = relationship(back_populates='clinic')
    children: Mapped[list['Children']] = relationship(back_populates='clinic')
    subscription: Mapped[Optional["Subscription"]] = relationship(
        'Subscription', back_populates='clinic', uselist=False,
        primaryjoin="and_(Clinic.id == foreign(Subscription.clinic_id), Subscription.status.in_(['trial', 'active']))",
        viewonly=True
    )

