from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, Text, DateTime, func, ForeignKey, Date
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
    status: Mapped[EnumStatus] = mapped_column()

    children: Mapped['Children'] = relationship(back_populates='therapy_plan')
    plan_exercises: Mapped[List['PlanExercises']] = relationship(back_populates='therapy_plan')
