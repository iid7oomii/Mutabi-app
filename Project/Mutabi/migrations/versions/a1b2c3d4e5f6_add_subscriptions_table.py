"""add subscriptions table

Revision ID: a1b2c3d4e5f6
Revises: fd0f10262af8
Create Date: 2026-06-08 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = 'fd0f10262af8'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('clinic_id', sa.String(36), sa.ForeignKey('clinics.id'), nullable=False),
        sa.Column('plan_type', sa.Enum('specialist', 'clinic', 'unlimited', name='plan_type_enum'), nullable=False),
        sa.Column('status', sa.Enum('trial', 'active', 'expired', 'cancelled', name='subscription_status_enum'), nullable=False),
        sa.Column('starts_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('moyasar_payment_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
    )
    op.create_index('ix_subscriptions_clinic_id', 'subscriptions', ['clinic_id'])
    op.create_index('ix_subscriptions_status', 'subscriptions', ['status'])


def downgrade():
    op.drop_index('ix_subscriptions_status', 'subscriptions')
    op.drop_index('ix_subscriptions_clinic_id', 'subscriptions')
    op.drop_table('subscriptions')
    op.execute("DROP TYPE IF EXISTS plan_type_enum")
    op.execute("DROP TYPE IF EXISTS subscription_status_enum")
