from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, ForeignKey
from app.models.BaseModel import BaseModel
from app.models.EnumDays import EnumDays

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
    target_days: Mapped[EnumDays] = mapped_column()

    therapy_plan: Mapped['TherapyPlans'] = relationship(back_populates='plan_exercises')
    exercise: Mapped['Exercises'] = relationship(back_populates='plan_exercises')
    exercises_feedback: Mapped[List['ExercisesFeedback']] = relationship(back_populates='plan_exercise')

