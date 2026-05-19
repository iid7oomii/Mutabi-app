from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import Integer, Text, String, ForeignKey, Date
import sqlalchemy
from app.models.BaseModel import BaseModel
from datetime import date
from app.models.EnumCompletion import EnumCompletion
import re

if TYPE_CHECKING:
    from app.models.Plan_Exercises import PlanExercises


class ExercisesFeedback(BaseModel):
    __tablename__ = 'exercise_feedback'

    plan_exercise_id: Mapped[str] = mapped_column(ForeignKey('plan_exercises.id'))
    feedback_date: Mapped[date] = mapped_column(Date)
    completion_status: Mapped[EnumCompletion] = mapped_column()
    completion_status: Mapped[Optional[EnumCompletion]] = mapped_column(
    sqlalchemy.Enum(EnumCompletion, values_callable=lambda x: [e.value for e in x])
    )
    pain_level: Mapped[int] = mapped_column(Integer)
    parent_notes: Mapped[Optional[str]] = mapped_column(Text)
    parent_media_url: Mapped[Optional[str]] = mapped_column(String(255))
    doctor_reply: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    plan_exercise: Mapped['PlanExercises'] = relationship(back_populates='exercises_feedback')

    @validates('plan_exercise_id')
    def validate_plan_exercise_id(self, key, value):
        if not value or not value.strip():
            raise ValueError("plan_exercise_id must not be empty")
        return value.strip()

    @validates('feedback_date')
    def validate_feedback_date(self, key, value):
        if value is None:
            raise ValueError("feedback_date must not be empty")
        if isinstance(value, str):
            from datetime import datetime
            value = datetime.strptime(value, '%Y-%m-%d').date()
        if value > date.today():
            raise ValueError("feedback_date must not be in the future")
        return value

    @validates('completion_status')
    def validate_completion_status(self, key, value):
        valid_values = [e.value for e in EnumCompletion]
        if value not in valid_values and value not in EnumCompletion:
            raise ValueError(f"completion_status must be one of: {valid_values}")
        return value

    @validates('pain_level')
    def validate_pain_level(self, key, value):
        if value is None:
            raise ValueError("pain_level must not be empty")
        if not isinstance(value, int):
            raise TypeError("pain_level must be an integer")
        if value < 0 or value > 10:
            raise ValueError("pain_level must be between 0 and 10")
        return value

    @validates('parent_notes')
    def validate_parent_notes(self, key, value):
        if value is not None and not isinstance(value, str):
            raise TypeError("parent_notes must be a string")
        return value

    @validates('parent_media_url')
    def validate_parent_media_url(self, key, value):
        if value is None:
            return value
        if not isinstance(value, str):
            raise TypeError("parent_media_url must be a string")
        url_pattern = r'^https?://.+'
        if not re.match(url_pattern, value):
            raise ValueError("parent_media_url must be a valid URL")
        return value
    

    @validates('doctor_reply')
    def validate_doctor_reply(self, key, value):
        if value is None or value == '':
            return None
        if not isinstance(value, str):
            raise TypeError("doctor_reply must be a string")
        if len(value) > 1000:
            raise ValueError("doctor_reply must be 1000 characters or less")
        return value.strip()