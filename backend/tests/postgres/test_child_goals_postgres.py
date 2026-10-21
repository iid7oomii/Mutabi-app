"""PostgreSQL checks for child goals in a temporary, isolated schema.

Use TEST_POSTGRES_URL for a dedicated test database, or set
GOALS_POSTGRES_TEST_ON_EXISTING_DB=1 to use DATABASE_URL explicitly.
"""

import os
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from threading import Event, Lock
from uuid import uuid4

import pytest
from flask_jwt_extended import create_access_token
from flask_migrate import upgrade
from sqlalchemy import create_engine, select, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import OperationalError

from app import create_app
from app.extensions import db
from app.goals.model import Goal, GoalReminderDelivery, GoalReminderSettings
from app.goals.reminders import dispatch_due_goal_reminders
from app.notifications.model import Notification


pytestmark = pytest.mark.postgres
MIGRATIONS = str(Path(__file__).resolve().parents[2] / 'migrations')


@pytest.fixture(scope='module')
def postgres_goals():
    use_existing_database = os.environ.get('GOALS_POSTGRES_TEST_ON_EXISTING_DB') == '1'
    raw_url = os.environ.get('DATABASE_URL' if use_existing_database else 'TEST_POSTGRES_URL')
    if not raw_url:
        pytest.skip('Set TEST_POSTGRES_URL, or explicitly set GOALS_POSTGRES_TEST_ON_EXISTING_DB=1 to use DATABASE_URL.')
    url = make_url(raw_url)
    if url.get_backend_name() != 'postgresql':
        pytest.fail('The selected database URL must point to PostgreSQL.')
    if not use_existing_database and not (url.database or '').endswith('_test'):
        pytest.fail('TEST_POSTGRES_URL must point to a database ending in _test.')
    host_override = os.environ.get('GOALS_POSTGRES_TEST_HOST')
    port_override = os.environ.get('GOALS_POSTGRES_TEST_PORT')
    if port_override:
        try:
            port = int(port_override)
        except ValueError:
            pytest.fail('GOALS_POSTGRES_TEST_PORT must be a valid port number.', pytrace=False)
        if not 1 <= port <= 65535:
            pytest.fail('GOALS_POSTGRES_TEST_PORT must be between 1 and 65535.', pytrace=False)
        url = url.set(port=port)
    if host_override:
        url = url.set(host=host_override)

    schema = f'goal_test_{uuid4().hex}'
    admin_engine = create_engine(url)
    connection_failed = False
    try:
        with admin_engine.begin() as connection:
            connection.exec_driver_sql(f'CREATE SCHEMA {schema}')
    except OperationalError:
        admin_engine.dispose()
        connection_failed = True
    if connection_failed:
        pytest.fail(
            'Could not connect to PostgreSQL. Check the host and port reachable from the pytest process. '
            'For Docker Compose from WSL, use GOALS_POSTGRES_TEST_HOST=localhost '
            'and GOALS_POSTGRES_TEST_PORT=5433.',
            pytrace=False,
        )
    scoped_url = url.update_query_dict({'options': f'-csearch_path={schema}'})
    ids = {key: str(uuid4()) for key in (
        'clinic', 'other_clinic', 'doctor', 'other_doctor', 'admin',
        'parent', 'other_parent', 'outside_admin', 'child', 'other_child', 'legacy_goal',
    )}
    app = None
    try:
        app = create_app({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': scoped_url.render_as_string(hide_password=False),
            'JWT_SECRET_KEY': 'postgres-goals-test-secret-at-least-32-bytes',
        })
        with app.app_context():
            # Build the old schema first, insert a real legacy row, then upgrade.
            upgrade(directory=MIGRATIONS, revision='a6c9e4b2d731')
            _seed_legacy_data(ids)
            upgrade(directory=MIGRATIONS, revision='head')
            yield app, ids
    finally:
        if app is not None:
            with app.app_context():
                db.session.remove()
                db.engine.dispose()
        with admin_engine.begin() as connection:
            connection.exec_driver_sql(f'DROP SCHEMA {schema} CASCADE')
        admin_engine.dispose()


def _seed_legacy_data(ids):
    for clinic in ('clinic', 'other_clinic'):
        db.session.execute(text('''
            INSERT INTO clinics (id, name, logo_url, contact_phone)
            VALUES (:id, :name, '', '0500000000')
        '''), {'id': ids[clinic], 'name': clinic})
    for name, role, clinic in (
        ('doctor', 'doctor', 'clinic'), ('other_doctor', 'doctor', 'clinic'),
        ('admin', 'admin', 'clinic'), ('parent', 'parent', 'clinic'),
        ('other_parent', 'parent', 'clinic'), ('outside_admin', 'admin', 'other_clinic'),
    ):
        db.session.execute(text('''
            INSERT INTO users (id, clinic_id, first_name, second_name, email,
                               phone, password, role, is_active)
            VALUES (:id, :clinic_id, 'Test', 'User', :email, :phone,
                    'unused-test-password', :role, true)
        '''), {
            'id': ids[name], 'clinic_id': ids[clinic],
            'email': f'{name}-{ids[name]}@example.test', 'phone': ids[name], 'role': role,
        })
    for child, parent in (('child', 'parent'), ('other_child', 'other_parent')):
        db.session.execute(text('''
            INSERT INTO children (id, clinic_id, parent_id, doctor_id,
                                  first_name, second_name, date_of_birth)
            VALUES (:id, :clinic_id, :parent_id, :doctor_id,
                    'Test', 'Child', :birth_date)
        '''), {
            'id': ids[child], 'clinic_id': ids['clinic'],
            'parent_id': ids[parent], 'doctor_id': ids['doctor'],
            'birth_date': date(2020, 1, 1),
        })
    db.session.execute(text('''
        INSERT INTO goals (id, child_id, created_by, title, success_criteria,
                           target_date, status, created_at)
        VALUES (:id, :child_id, :created_by, 'Legacy goal', 'Legacy criterion',
                :target_date, 'active', :created_at)
    '''), {
        'id': ids['legacy_goal'], 'child_id': ids['child'],
        'created_by': ids['doctor'],
        'target_date': date.today() + timedelta(days=14),
        'created_at': datetime.combine(date.today() - timedelta(days=1), time(12)),
    })
    db.session.commit()


def _headers(app, ids, actor):
    role = 'doctor' if actor in ('doctor', 'other_doctor') else (
        'admin' if actor in ('admin', 'outside_admin') else 'parent'
    )
    clinic = ids['other_clinic'] if actor == 'outside_admin' else ids['clinic']
    with app.app_context():
        token = create_access_token(identity=ids[actor], additional_claims={
            'role': role, 'clinic_id': clinic,
        })
    return {'Authorization': f'Bearer {token}'}


def _payload(ids, **changes):
    return {
        'child_id': ids['child'], 'title': 'Independent task',
        'success_criteria': 'Three unassisted attempts',
        'start_date': date.today().isoformat(),
        'end_date': (date.today() + timedelta(days=14)).isoformat(),
        'reminder_frequency': 'daily', **changes,
    }


def test_postgres_migration_backfills_legacy_goal_and_creates_reminder_tables(postgres_goals):
    app, ids = postgres_goals
    with app.app_context():
        goal = db.session.get(Goal, ids['legacy_goal'])
        assert goal.start_date == date.today() - timedelta(days=1)
        assert goal.end_date == date.today() + timedelta(days=14)
        assert goal.reminder_frequency == 'none'
        assert db.session.execute(text('SELECT version_num FROM alembic_version')).scalar_one() == 'b7d2e1c4a901'
        assert db.session.execute(text("SELECT to_regclass('goal_reminder_settings')")).scalar_one()
        assert db.session.execute(text("SELECT to_regclass('goal_reminder_deliveries')")).scalar_one()
        assert db.session.execute(text('''
            SELECT count(*) FROM pg_constraint
            WHERE conname = 'uq_goal_reminder_user_date'
              AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
        ''')).scalar_one() == 1


def test_postgres_goal_api_permissions_and_input_validation(postgres_goals):
    app, ids = postgres_goals
    client = app.test_client()
    doctor = _headers(app, ids, 'doctor')
    parent = _headers(app, ids, 'parent')
    admin = _headers(app, ids, 'admin')

    created = client.post('/api/v1/goals/', json=_payload(ids), headers=doctor)
    assert created.status_code == 201, created.get_json()
    goal_id = created.get_json()['id']
    viewed = client.get(f"/api/v1/goals/child/{ids['child']}", headers=parent)
    assert viewed.status_code == 200
    assert any(goal['id'] == goal_id for goal in viewed.get_json())

    for actor in ('other_doctor', 'outside_admin', 'parent', 'other_parent'):
        response = client.patch(f'/api/v1/goals/{goal_id}', json={'title': 'Hijacked'}, headers=_headers(app, ids, actor))
        assert response.status_code == 403
    assert client.post('/api/v1/goals/', json=_payload(ids), headers=parent).status_code == 403
    assert client.post('/api/v1/goals/', json=_payload(ids, status='completed'), headers=doctor).status_code == 400
    assert client.patch(f'/api/v1/goals/{goal_id}', json={'title': 'X' * 161}, headers=doctor).status_code == 400

    changed = client.patch(f'/api/v1/goals/{goal_id}', json={'title': 'Updated task'}, headers=admin)
    assert changed.status_code == 200
    assert changed.get_json()['title'] == 'Updated task'
    completed = client.post(f'/api/v1/goals/{goal_id}/complete', json={}, headers=admin)
    assert completed.status_code == 200
    assert completed.get_json()['status'] == 'completed'


def test_postgres_concurrent_workers_send_only_one_reminder(postgres_goals):
    app, ids = postgres_goals
    client = app.test_client()
    created = client.post('/api/v1/goals/', json=_payload(ids, title='Concurrent reminder'), headers=_headers(app, ids, 'doctor'))
    assert created.status_code == 201, created.get_json()
    settings = client.put('/api/v1/goals/reminder-settings', json={
        'time': '16:00', 'timezone': 'Asia/Riyadh', 'enabled': True,
    }, headers=_headers(app, ids, 'parent'))
    assert settings.status_code == 200, settings.get_json()

    now = datetime.combine(date.today() + timedelta(days=1), time(13), timezone.utc)
    sending = Event()
    release = Event()
    calls = []
    call_lock = Lock()

    def send(parent_id, title, body):
        with call_lock:
            calls.append((parent_id, title, body))
        sending.set()
        assert release.wait(timeout=10), 'Timed out waiting for the overlapping worker.'
        return True

    def run_worker():
        with app.app_context():
            return dispatch_due_goal_reminders(now, send)

    with ThreadPoolExecutor(max_workers=2) as executor:
        first = executor.submit(run_worker)
        try:
            assert sending.wait(timeout=10), 'First worker did not reach the send step.'
            second = executor.submit(run_worker)
            assert second.result(timeout=10) == 0
        finally:
            release.set()
        assert first.result(timeout=10) == 1

    assert len(calls) == 1
    assert calls[0][0] == ids['parent']
    with app.app_context():
        deliveries = db.session.scalars(select(GoalReminderDelivery).where(
            GoalReminderDelivery.user_id == ids['parent'],
            GoalReminderDelivery.local_date == date.today() + timedelta(days=1),
        )).all()
        assert len(deliveries) == 1 and deliveries[0].sent
        notifications = db.session.scalars(select(Notification).where(
            Notification.user_id == ids['parent'],
            Notification.type == 'goal_reminder',
        )).all()
        assert len(notifications) == 1
        assert db.session.scalar(select(GoalReminderSettings).where(
            GoalReminderSettings.user_id == ids['parent'],
        )).time == '16:00'
