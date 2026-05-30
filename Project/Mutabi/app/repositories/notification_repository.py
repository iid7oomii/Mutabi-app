from typing import List
from app.models.Notification import Notification
from app import db


class NotificationRepository:

    @staticmethod
    def create(user_id: str, title: str, body: str, type: str = 'system') -> Notification:
        notif = Notification(user_id=user_id, title=title, body=body, type=type)
        db.session.add(notif)
        db.session.commit()
        return notif

    @staticmethod
    def get_by_user(user_id: str) -> List[Notification]:
        return (
            db.session.query(Notification)
            .filter_by(user_id=user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )

    @staticmethod
    def mark_read(notification_id: str, user_id: str) -> bool:
        notif = (
            db.session.query(Notification)
            .filter_by(id=notification_id, user_id=user_id)
            .first()
        )
        if not notif:
            return False
        notif.is_read = True
        db.session.commit()
        return True

    @staticmethod
    def mark_all_read(user_id: str) -> int:
        count = (
            db.session.query(Notification)
            .filter_by(user_id=user_id, is_read=False)
            .update({'is_read': True})
        )
        db.session.commit()
        return count
