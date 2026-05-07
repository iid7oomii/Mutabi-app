from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy import Integer, ForeignKey
import sqlalchemy
from app.models.BaseModel import BaseModel
from app.models.EnumDays import EnumDays
from sqlalchemy.orm import reconstructor

if TYPE_CHECKING:
    from app.models.Therapy_plans import TherapyPlans
    from app.models.Exercises import Exercises
    from app.models.Exercises_Feedback import ExercisesFeedback


class PlanExercises(BaseModel):
    __tablename__ = 'plan_exercises'

    therapy_plan_id: Mapped[str] = mapped_column(ForeignKey('therapy_plans.id'))
    exercise_id: Mapped[str] = mapped_column(ForeignKey('exercises.id'))
    reps: Mapped[Optional[int]] = mapped_column(Integer)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    target_days: Mapped[Optional[EnumDays]] = mapped_column(
    sqlalchemy.Enum(EnumDays, values_callable=lambda x: [e.value for e in x])
    )

    therapy_plan: Mapped['TherapyPlans'] = relationship(back_populates='plan_exercises')
    exercise: Mapped['Exercises'] = relationship(back_populates='plan_exercises')
    exercises_feedback: Mapped[List['ExercisesFeedback']] = relationship(back_populates='plan_exercise')

    @validates('therapy_plan_id', 'exercise_id')
    def validate_ids(self, key, value):
        if not value or not value.strip():
            raise ValueError(f"{key} must not be empty")
        return value.strip()

    @validates('reps')
    def validate_reps(self, key, value):
        if value is None:
            return value
        if not isinstance(value, int):
            raise TypeError("reps must be an integer")
        if value <= 0:
            raise ValueError("reps must be greater than 0")
        return value

    @validates('duration_minutes')
    def validate_duration_minutes(self, key, value):
        if value is None:
            return value
        if not isinstance(value, int):
            raise TypeError("duration_minutes must be an integer")
        if value <= 0:
            raise ValueError("duration_minutes must be greater than 0")
        return value

    @validates('target_days')
    def validate_target_days(self, key, value):
        valid_values = [e.value for e in EnumDays]
        if isinstance(value, EnumDays):
            return value
        if value not in valid_values:
            raise ValueError(f"target_days must be one of: {valid_values}")
        return value