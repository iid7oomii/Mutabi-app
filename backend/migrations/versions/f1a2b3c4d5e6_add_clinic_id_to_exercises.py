"""add clinic_id to exercises

Revision ID: f1a2b3c4d5e6
Revises: d573fa067829
Create Date: 2026-06-10 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'f1a2b3c4d5e6'
down_revision = 'd573fa067829'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('exercises', sa.Column('clinic_id', sa.String(length=36), nullable=True))
    op.create_index(op.f('ix_exercises_clinic_id'), 'exercises', ['clinic_id'], unique=False)
    op.create_foreign_key('fk_exercises_clinic_id', 'exercises', 'clinics', ['clinic_id'], ['id'])


def downgrade():
    op.drop_constraint('fk_exercises_clinic_id', 'exercises', type_='foreignkey')
    op.drop_index(op.f('ix_exercises_clinic_id'), table_name='exercises')
    op.drop_column('exercises', 'clinic_id')
