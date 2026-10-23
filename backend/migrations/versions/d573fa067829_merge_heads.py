"""merge heads

Revision ID: d573fa067829
Revises: a1b2c3d4e5f6, e4f5a6b7c8d9
Create Date: 2026-06-09 20:04:56.023747

"""
from alembic import op
import sqlalchemy as sa

revision = 'd573fa067829'
down_revision = ('a1b2c3d4e5f6', 'e4f5a6b7c8d9')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass
