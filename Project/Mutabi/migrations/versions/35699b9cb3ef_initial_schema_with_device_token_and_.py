"""initial schema with device_token and invitation_token

Revision ID: 35699b9cb3ef
Revises: 
Create Date: 2026-05-02 15:32:49.269754

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '35699b9cb3ef'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('clinics',
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('logo_url', sa.String(length=255), nullable=False),
    sa.Column('address', sa.String(length=255), nullable=True),
    sa.Column('contact_phone', sa.String(length=255), nullable=False),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('exercises',
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('doctor_media_url', sa.String(length=255), nullable=True),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('clinic_id', sa.String(length=36), nullable=False),
    sa.Column('first_name', sa.String(length=50), nullable=False),
    sa.Column('second_name', sa.String(length=50), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('phone', sa.String(length=50), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.Column('role', sa.Enum('admin', 'parent', 'doctor', name='roleuser'), nullable=False),
    sa.Column('specialty', sa.String(length=255), nullable=True),
    sa.Column('relationship_type', sa.Enum('mother', 'father', 'guardian', 'therapist', 'doctor', 'other', name='relationshiptype'), nullable=True),
    sa.Column('custom_relationship', sa.String(length=100), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('device_token', sa.String(length=255), nullable=True),
    sa.Column('invitation_token', sa.String(length=255), nullable=True),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('children',
    sa.Column('clinic_id', sa.String(length=36), nullable=False),
    sa.Column('parent_id', sa.String(length=36), nullable=False),
    sa.Column('doctor_id', sa.String(length=36), nullable=False),
    sa.Column('first_name', sa.String(length=255), nullable=False),
    sa.Column('second_name', sa.String(length=255), nullable=False),
    sa.Column('date_of_birth', sa.Date(), nullable=False),
    sa.Column('diagnosis_notes', sa.Text(), nullable=True),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
    sa.ForeignKeyConstraint(['doctor_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['parent_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('appointments',
    sa.Column('child_id', sa.String(length=36), nullable=False),
    sa.Column('doctor_id', sa.String(length=36), nullable=False),
    sa.Column('appointment', sa.Date(), nullable=False),
    sa.Column('notes', sa.Text(), nullable=False),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['child_id'], ['children.id'], ),
    sa.ForeignKeyConstraint(['doctor_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('therapy_plans',
    sa.Column('child_id', sa.String(length=36), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('start_date', sa.Date(), nullable=True),
    sa.Column('end_date', sa.Date(), nullable=True),
    sa.Column('status', sa.Enum('active', 'completed', 'cancelled', name='enumstatus'), nullable=False),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['child_id'], ['children.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('plan_exercises',
    sa.Column('therapy_plan_id', sa.String(length=36), nullable=False),
    sa.Column('exercise_id', sa.String(length=36), nullable=False),
    sa.Column('reps', sa.Integer(), nullable=True),
    sa.Column('duration_minutes', sa.Integer(), nullable=True),
    sa.Column('target_days', sa.Enum('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', name='enumdays'), nullable=False),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['exercise_id'], ['exercises.id'], ),
    sa.ForeignKeyConstraint(['therapy_plan_id'], ['therapy_plans.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('exercise_feedback',
    sa.Column('plan_exercise_id', sa.String(length=36), nullable=False),
    sa.Column('feedback_date', sa.Date(), nullable=False),
    sa.Column('completion_status', sa.Enum('completed', 'partially_completed', 'skipped', name='enumcompletion'), nullable=False),
    sa.Column('pain_level', sa.Integer(), nullable=False),
    sa.Column('parent_notes', sa.Text(), nullable=True),
    sa.Column('parent_media_url', sa.String(length=255), nullable=True),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['plan_exercise_id'], ['plan_exercises.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('exercise_feedback')
    op.drop_table('plan_exercises')
    op.drop_table('therapy_plans')
    op.drop_table('appointments')
    op.drop_table('children')
    op.drop_table('users')
    op.drop_table('exercises')
    op.drop_table('clinics')
    # ### end Alembic commands ###
