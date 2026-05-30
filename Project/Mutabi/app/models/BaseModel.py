from app import db
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, DateTime, func
import uuid


class BaseModel(db.Model):
    __abstract__ = True

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(
    server_default=func.now(),
    onupdate=func.now(),
    nullable=True
)

    def to_dict(self, exclude: list = None) -> dict:
        exclude = exclude or []
        result = {}
        for column in self.__table__.columns:
            if column.name in exclude:
                continue
            value = getattr(self, column.name)
            if isinstance(value, datetime):
                value = value.isoformat()
            elif hasattr(value, 'value'):
                value = value.value
            result[column.name] = value
        return result