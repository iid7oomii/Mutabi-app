from typing import Optional
from datetime import datetime
from app.models.Subscription import Subscription
from app import db
from sqlalchemy import or_


class SubscriptionRepository:

    @staticmethod
    def create(data: dict) -> Subscription:
        sub = Subscription(**data)
        db.session.add(sub)
        db.session.commit()
        return sub

    @staticmethod
    def get_by_id(sub_id: str) -> Optional[Subscription]:
        return db.session.get(Subscription, sub_id)

    @staticmethod
    def get_active_by_clinic(clinic_id: str) -> Optional[Subscription]:
        return (
            db.session.query(Subscription)
            .filter(
                Subscription.clinic_id == clinic_id,
                Subscription.status.in_(['trial', 'active']),
                Subscription.expires_at > datetime.utcnow(),
                # Exclude pending-payment subscriptions (have invoice ID but not yet verified)
                or_(
                    Subscription.moyasar_payment_id == None,
                    Subscription.status == 'active',
                ),
            )
            .order_by(Subscription.expires_at.desc())
            .first()
        )

    @staticmethod
    def get_latest_by_clinic(clinic_id: str) -> Optional[Subscription]:
        return (
            db.session.query(Subscription)
            .filter_by(clinic_id=clinic_id)
            .order_by(Subscription.created_at.desc())
            .first()
        )

    @staticmethod
    def get_by_moyasar_payment_id(payment_id: str) -> Optional[Subscription]:
        return (
            db.session.query(Subscription)
            .filter_by(moyasar_payment_id=payment_id)
            .first()
        )

    @staticmethod
    def update(sub_id: str, data: dict) -> Optional[Subscription]:
        sub = db.session.get(Subscription, sub_id)
        if not sub:
            return None
        for key, value in data.items():
            setattr(sub, key, value)
        db.session.commit()
        return sub

    @staticmethod
    def get_all() -> list:
        return (
            db.session.query(Subscription)
            .order_by(Subscription.created_at.desc())
            .all()
        )

    @staticmethod
    def count_by_status(status: str) -> int:
        return (
            db.session.query(Subscription)
            .filter(
                Subscription.status == status,
                Subscription.expires_at > datetime.utcnow(),
            )
            .count()
        )

    @staticmethod
    def expire_stale():
        db.session.query(Subscription).filter(
            Subscription.status.in_(['trial', 'active']),
            Subscription.expires_at <= datetime.utcnow(),
        ).update({'status': 'expired'})
        db.session.commit()
