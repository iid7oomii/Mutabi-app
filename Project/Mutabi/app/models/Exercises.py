from typing import Optional, TYPE_CHECKING, List
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text
from app.models.BaseModel import BaseModel

if TYPE_CHECKING:
    from app.models.Plan_Exercises import PlanExercises

class Exercises(BaseModel):
    __tablename__ = 'exercises'

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    doctor_media_url: Mapped[Optional[str]] = mapped_column(String(255))

    plan_exercises: Mapped[List['PlanExercises']] = relationship(back_populates='exercise')
