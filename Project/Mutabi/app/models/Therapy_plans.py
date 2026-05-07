from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import String, Text, ForeignKey, Date
import sqlalchemy
from app.models.BaseModel import BaseModel
from datetime import date
from app.models.EnumStatus import EnumStatus

if TYPE_CHECKING:
    from app.models.Children import Children
    from app.models.Plan_Exercises import PlanExercises


class TherapyPlans(BaseModel):
    __tablename__ = 'therapy_plans'

    child_id: Mapped[str] = mapped_column(ForeignKey('children.id'))
    title: Mapped[str] = mapped_column(String(255))
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    status: Mapped[Optional[EnumStatus]] = mapped_column(
    sqlalchemy.Enum(EnumStatus, values_callable=lambda x: [e.value for e in x])
    )

    children: Mapped['Children'] = relationship(back_populates='therapy_plan')
    plan_exercises: Mapped[List['PlanExercises']] = relationship(back_populates='therapy_plan')

    @validates('child_id')
    def validate_child_id(self, key, value):
        if not value or not value.strip():
            raise ValueError("child_id must not be empty")
        return value.strip()

    @validates('title')
    def validate_title(self, key, value):
        if not value or not value.strip():
            raise ValueError("title must not be empty")
        if not isinstance(value, str):
            raise TypeError("title must be a string")
        if len(value) > 255:
            raise ValueError("title must be 255 characters or less")
        return value.strip()

    @validates('start_date')
    def validate_start_date(self, key, value):
        if value is None:
            return value
        if isinstance(value, str):
            from datetime import datetime
            value = datetime.strptime(value, '%Y-%m-%d').date()
        if value < date.today():
            raise ValueError("start_date must be today or in the future")
        return value

    @validates('end_date')
    def validate_end_date(self, key, value):
        if value is None:
            return value
        if isinstance(value, str):
            from datetime import datetime
            value = datetime.strptime(value, '%Y-%m-%d').date()
        return value

    @validates('status')
    def validate_status(self, key, value):
        valid_values = [e.value for e in EnumStatus]
        if value not in valid_values and value not in EnumStatus:
            raise ValueError(f"status must be one of: {valid_values}")
        return value