from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, String, ForeignKey, Date
from app.models.BaseModel import BaseModel
from datetime import date
from app.models.EnumCompletion import EnumCompletion

if TYPE_CHECKING:
    from app.models.Plan_Exercises import PlanExercises


class ExercisesFeedback(BaseModel):
    __tablename__ = 'exercise_feedback'

    plan_exercise_id: Mapped[str] = mapped_column(ForeignKey('plan_exercises.id'))
    feedback_date: Mapped[date] = mapped_column(Date)
    completion_status: Mapped[EnumCompletion] = mapped_column()
    pain_level: Mapped[int] = mapped_column(Integer)
    parent_notes: Mapped[Optional[str]] = mapped_column(Text)
    parent_media_url: Mapped[Optional[str]] = mapped_column(String(255))

    plan_exercise: Mapped['PlanExercises'] = relationship(back_populates='exercises_feedback')
