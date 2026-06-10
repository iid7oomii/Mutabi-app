from __future__ import annotations
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Enum as SAEnum, DateTime, ForeignKey, Boolean
from app.models.BaseModel import BaseModel

if TYPE_CHECKING:
    from app.models.Clinics import Clinic

PLAN_TYPES = ['specialist', 'clinic', 'unlimited']
SUBSCRIPTION_STATUSES = ['trial', 'active', 'expired', 'cancelled']

PLANS = {
    'specialist': {
        'display_name': 'أخصائي',
        'max_doctors': 1,
        'max_patients_per_doctor': 20,
        'price_sar': 1200,
        'price_halalas': 120000,
        'description': 'مناسبة للأخصائي المستقل — طبيب واحد وحتى 20 مريضاً',
    },
    'clinic': {
        'display_name': 'عيادة',
        'max_doctors': 5,
        'max_patients_per_doctor': 20,
        'price_sar': 3600,
        'price_halalas': 360000,
        'description': 'مناسبة للعيادات — حتى 5 أطباء وحتى 20 مريضاً لكل طبيب',
    },
    'unlimited': {
        'display_name': 'بلا حدود',
        'max_doctors': -1,
        'max_patients_per_doctor': -1,
        'price_sar': 7200,
        'price_halalas': 720000,
        'description': 'للعيادات الكبيرة — عدد غير محدود مع أولوية في طلبات الميزات',
    },
}


class Subscription(BaseModel):
    __tablename__ = 'subscriptions'

    clinic_id: Mapped[str] = mapped_column(String(36), ForeignKey('clinics.id'))
    plan_type: Mapped[str] = mapped_column(SAEnum(*PLAN_TYPES, name='plan_type_enum'))
    status: Mapped[str] = mapped_column(SAEnum(*SUBSCRIPTION_STATUSES, name='subscription_status_enum'))
    starts_at: Mapped[str] = mapped_column(DateTime)
    expires_at: Mapped[str] = mapped_column(DateTime)
    moyasar_payment_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    clinic: Mapped['Clinic'] = relationship('Clinic', back_populates='subscription')
