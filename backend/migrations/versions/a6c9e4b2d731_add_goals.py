"""Add therapeutic goals.

Revision ID: a6c9e4b2d731
Revises: f1a2b3c4d5e6
"""
from alembic import op
import sqlalchemy as sa


revision = 'a6c9e4b2d731'
down_revision = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'goals',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('child_id', sa.String(length=36), sa.ForeignKey('children.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_by', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(length=160), nullable=False),
        sa.Column('success_criteria', sa.String(length=300), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('target_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=24), server_default='active', nullable=False),
    )
    op.create_index('ix_goals_child_id', 'goals', ['child_id'])


def downgrade():
    op.drop_index('ix_goals_child_id', table_name='goals')
    op.drop_table('goals')
