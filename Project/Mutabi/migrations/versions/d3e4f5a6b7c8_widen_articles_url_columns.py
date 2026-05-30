"""widen articles url columns to Text

Revision ID: d3e4f5a6b7c8
Revises: c2d3e4f5a6b7
Create Date: 2026-05-30 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'd3e4f5a6b7c8'
down_revision = 'c2d3e4f5a6b7'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('articles', schema=None) as batch_op:
        batch_op.alter_column('article_url',
               existing_type=sa.String(255),
               type_=sa.Text(),
               existing_nullable=False)
        batch_op.alter_column('image_url',
               existing_type=sa.String(255),
               type_=sa.Text(),
               existing_nullable=True)


def downgrade():
    with op.batch_alter_table('articles', schema=None) as batch_op:
        batch_op.alter_column('image_url',
               existing_type=sa.Text(),
               type_=sa.String(255),
               existing_nullable=True)
        batch_op.alter_column('article_url',
               existing_type=sa.Text(),
               type_=sa.String(255),
               existing_nullable=False)
