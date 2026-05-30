"""add notifications table

Revision ID: c1d2e3f4a5b6
Revises: b2c3d4e5f6a7
Create Date: 2026-05-30 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'c1d2e3f4a5b6'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('body', sa.Text, nullable=False),
        sa.Column('type', sa.String(50), nullable=False, server_default='system'),
        sa.Column('is_read', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])


def downgrade():
    op.drop_index('ix_notifications_user_id', 'notifications')
    op.drop_table('notifications')
