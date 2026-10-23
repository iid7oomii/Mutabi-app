from datetime import date
from typing import Optional

from sqlalchemy import Boolean, Date, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.common.base_model import BaseModel


class Goal(BaseModel):
    __tablename__ = 'goals'

    child_id: Mapped[str] = mapped_column(ForeignKey('children.id', ondelete='CASCADE'), index=True)
    created_by: Mapped[Optional[str]] = mapped_column(ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    title: Mapped[str] = mapped_column(String(160))
    success_criteria: Mapped[str] = mapped_column(String(300))
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Retained for existing rows; new requests use start_date and end_date.
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    reminder_frequency: Mapped[str] = mapped_column(String(20), default='none', server_default='none')
    status: Mapped[str] = mapped_column(String(24), default='active', server_default='active')

    @property
    def effective_status(self):
        if self.status == 'active' and self.end_date and self.end_date < date.today():
            return 'awaiting_review'
        return self.status

    def to_dict(self, exclude=None):
        data = super().to_dict(exclude=['target_date', *(exclude or [])])
        data['status'] = self.effective_status
        data['remaining_days'] = max(0, (self.end_date - date.today()).days) if self.end_date else None
        return data


class GoalReminderSettings(BaseModel):
    __tablename__ = 'goal_reminder_settings'

    user_id: Mapped[str] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), unique=True, index=True)
    time: Mapped[str] = mapped_column(String(5), default='16:00', server_default='16:00')
    timezone: Mapped[str] = mapped_column(String(255), default='Asia/Riyadh', server_default='Asia/Riyadh')
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default='1')


class GoalReminderDelivery(BaseModel):
    __tablename__ = 'goal_reminder_deliveries'
    __table_args__ = (UniqueConstraint('user_id', 'local_date', name='uq_goal_reminder_user_date'),)

    user_id: Mapped[str] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    local_date: Mapped[date] = mapped_column(Date)
    sent: Mapped[bool] = mapped_column(Boolean, default=False, server_default='0')
