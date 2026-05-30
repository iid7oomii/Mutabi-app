from typing import Optional, TYPE_CHECKING, List
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import String, Text
from app.models.BaseModel import BaseModel
import re

if TYPE_CHECKING:
    from app.models.Plan_Exercises import PlanExercises

class Exercises(BaseModel):
    __tablename__ = 'exercises'

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    doctor_media_url: Mapped[Optional[str]] = mapped_column(String(255))

    plan_exercises: Mapped[List['PlanExercises']] = relationship(back_populates='exercise')

    @validates('title')
    def validate_title(self, key, value):
        if not value or not value.strip():
            raise ValueError("title must not be empty")
        if not isinstance(value, str):
            raise TypeError("title must be a string")
        if len(value) > 255:
            raise ValueError("title must be 255 characters or less")
        return value.strip()

    @validates('description')
    def validate_description(self, key, value):
        if not value or not value.strip():
            raise ValueError("description must not be empty")
        if not isinstance(value, str):
            raise TypeError("description must be a string")
        return value.strip()

    @validates('doctor_media_url')
    def validate_doctor_media_url(self, key, value):
        if value is None or value == '':
            return None
        if not isinstance(value, str):
            raise TypeError("doctor_media_url must be a string")
        return value