from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, Boolean, ForeignKey
from app.models.BaseModel import BaseModel

if TYPE_CHECKING:
    pass


class Notification(BaseModel):
    __tablename__ = 'notifications'

    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'))
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(50), default='system')
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
