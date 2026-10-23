"""add icon, difficulty, goal, steps_json to exercises

Revision ID: e4f5a6b7c8d9
Revises: d3e4f5a6b7c8
Create Date: 2026-05-31 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'e4f5a6b7c8d9'
down_revision = 'd3e4f5a6b7c8'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('exercises', sa.Column('icon', sa.String(60), nullable=True))
    op.add_column('exercises', sa.Column('difficulty', sa.String(20), nullable=True))
    op.add_column('exercises', sa.Column('goal', sa.String(255), nullable=True))
    op.add_column('exercises', sa.Column('steps_json', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('exercises', 'steps_json')
    op.drop_column('exercises', 'goal')
    op.drop_column('exercises', 'difficulty')
    op.drop_column('exercises', 'icon')
