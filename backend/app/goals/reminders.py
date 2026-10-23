"""Schedule and deliver one encouraging goal reminder per parent and local day."""

from collections import defaultdict
from datetime import date, datetime, time, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.children.model import Children
from app.goals.model import Goal, GoalReminderDelivery, GoalReminderSettings
from app.notifications.model import Notification
from app.users.model import Users


def is_due_on_date(created_on, start_on, end_on, frequency, status, on_date):
    if status != 'active' or frequency == 'none':
        return False
    if on_date < created_on or on_date < start_on or on_date > end_on:
        return False
    elapsed = (on_date - created_on).days
    if frequency == 'daily':
        return True
    if frequency == 'weekly':
        return elapsed % 7 == 0
    if frequency == 'twice_weekly':
        return elapsed % 7 in (0, 3)
    return False


def _local_created_date(goal, zone):
    created_at = goal.created_at
    if created_at is None:
        return date.today()
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return created_at.astimezone(zone).date()


def dispatch_due_goal_reminders(now_utc, send):
    """Call ``send(parent_id, title, body)`` for each eligible parent once.

    A delivery claim is committed before sending so concurrent workers cannot
    send the same local-day reminder. Failed sends release the claim for retry.
    """
    if now_utc.tzinfo is None:
        raise ValueError('now_utc must be timezone-aware')
    now_utc = now_utc.astimezone(timezone.utc)
    rows = db.session.execute(
        select(Goal, Children.parent_id, Children.first_name)
        .join(Children, Goal.child_id == Children.id)
        .where(Goal.status == 'active')
    ).all()
    by_parent = defaultdict(list)
    for goal, parent_id, child_name in rows:
        by_parent[str(parent_id)].append((goal, child_name))

    sent_count = 0
    for parent_id, goals in by_parent.items():
        settings = db.session.scalar(
            select(GoalReminderSettings).where(GoalReminderSettings.user_id == parent_id)
        )
        if settings and not settings.enabled:
            continue
        zone = ZoneInfo(settings.timezone if settings else 'Asia/Riyadh')
        local_now = now_utc.astimezone(zone)
        local_day = local_now.date()
        reminder_time = time.fromisoformat(settings.time if settings else '16:00')
        if local_now.time() < reminder_time:
            continue
        due = [
            (goal, child_name)
            for goal, child_name in goals
            if goal.start_date and goal.end_date and is_due_on_date(
                _local_created_date(goal, zone), goal.start_date,
                goal.end_date, goal.reminder_frequency, goal.status,
                local_day,
            )
        ]
        if not due:
            continue
        already = db.session.scalar(
            select(GoalReminderDelivery).where(
                GoalReminderDelivery.user_id == parent_id,
                GoalReminderDelivery.local_date == local_day,
            )
        )
        if already:
            continue
        claim = GoalReminderDelivery(user_id=parent_id, local_date=local_day, sent=False)
        db.session.add(claim)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            continue
        title = 'خطوة صغيرة اليوم تصنع فرقًا 🌱'
        descriptions = [f'{child_name}: {goal.title}' for goal, child_name in due]
        body = 'تذكّروا أهداف الطفل: ' + '، '.join(descriptions)
        try:
            delivered = bool(send(parent_id, title, body))
        except Exception:
            delivered = False
        if delivered:
            claim.sent = True
            db.session.add(Notification(user_id=parent_id, title=title, body=body, type='goal_reminder'))
            db.session.commit()
            sent_count += 1
        else:
            db.session.delete(claim)
            db.session.commit()
    return sent_count


def send_push_goal_reminders(now_utc=None):
    from app.integrations.notifications import FCMNotificationClient

    client = FCMNotificationClient()

    def send(parent_id, title, body):
        user = db.session.get(Users, parent_id)
        return bool(user and user.device_token and client.send(
            user.device_token, title, body, data={'type': 'goal_reminder'}
        ))

    return dispatch_due_goal_reminders(now_utc or datetime.now(timezone.utc), send)


def register_goal_reminder_command(app):
    @app.cli.command('send-goal-reminders')
    def send_goal_reminders_command():
        count = send_push_goal_reminders()
        print(f'Sent {count} goal reminder notification(s).')
