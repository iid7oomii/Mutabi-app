"""Add child goal duration and reminder preferences.

Revision ID: b7d2e1c4a901
Revises: a6c9e4b2d731
"""
from datetime import date, datetime

from alembic import op
import sqlalchemy as sa


revision = 'b7d2e1c4a901'
down_revision = 'a6c9e4b2d731'
branch_labels = None
depends_on = None


def _as_date(value):
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value)[:10])


def upgrade():
    op.add_column('goals', sa.Column('start_date', sa.Date(), nullable=True))
    op.add_column('goals', sa.Column('end_date', sa.Date(), nullable=True))
    op.add_column('goals', sa.Column('reminder_frequency', sa.String(length=20), nullable=False, server_default='none'))

    connection = op.get_bind()
    legacy = connection.execute(sa.text('SELECT id, created_at, target_date FROM goals')).all()
    for goal_id, created_at, target_date in legacy:
        end_date = _as_date(target_date) if target_date else _as_date(created_at)
        start_date = min(_as_date(created_at), end_date)
        connection.execute(
            sa.text('UPDATE goals SET start_date = :start_date, end_date = :end_date WHERE id = :id'),
            {'start_date': start_date, 'end_date': end_date, 'id': goal_id},
        )

    op.create_table(
        'goal_reminder_settings',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('time', sa.String(length=5), server_default='16:00', nullable=False),
        sa.Column('timezone', sa.String(length=255), server_default='Asia/Riyadh', nullable=False),
        sa.Column('enabled', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.UniqueConstraint('user_id', name='uq_goal_reminder_settings_user'),
    )
    op.create_index('ix_goal_reminder_settings_user_id', 'goal_reminder_settings', ['user_id'])
    op.create_table(
        'goal_reminder_deliveries',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('local_date', sa.Date(), nullable=False),
        sa.Column('sent', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.UniqueConstraint('user_id', 'local_date', name='uq_goal_reminder_user_date'),
    )
    op.create_index('ix_goal_reminder_deliveries_user_id', 'goal_reminder_deliveries', ['user_id'])


def downgrade():
    op.drop_index('ix_goal_reminder_deliveries_user_id', table_name='goal_reminder_deliveries')
    op.drop_table('goal_reminder_deliveries')
    op.drop_index('ix_goal_reminder_settings_user_id', table_name='goal_reminder_settings')
    op.drop_table('goal_reminder_settings')
    op.drop_column('goals', 'reminder_frequency')
    op.drop_column('goals', 'end_date')
    op.drop_column('goals', 'start_date')
