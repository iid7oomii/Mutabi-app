from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text
from app.models.BaseModel import BaseModel

class Articles(BaseModel):
    __tablename__ = 'articles'

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    article_url: Mapped[str] = mapped_column(Text)
    

