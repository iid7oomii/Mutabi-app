"""add articles table and fix appointment datetime

Revision ID: c2d3e4f5a6b7
Revises: b2c3d4e5f6a7
Create Date: 2026-05-30 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'c2d3e4f5a6b7'
down_revision = 'c1d2e3f4a5b6'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'articles',
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('image_url', sa.String(255), nullable=True),
        sa.Column('article_url', sa.String(255), nullable=False),
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    with op.batch_alter_table('appointments', schema=None) as batch_op:
        batch_op.alter_column(
            'appointment',
            existing_type=sa.Date(),
            type_=sa.DateTime(),
            existing_nullable=False,
            postgresql_using='appointment::timestamp',
        )


def downgrade():
    with op.batch_alter_table('appointments', schema=None) as batch_op:
        batch_op.alter_column(
            'appointment',
            existing_type=sa.DateTime(),
            type_=sa.Date(),
            existing_nullable=False,
            postgresql_using='appointment::date',
        )

    op.drop_table('articles')
