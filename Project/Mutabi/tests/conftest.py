import pytest
from datetime import datetime
from app import create_app, db

VALID_PASSWORD = 'Passw0rd!'


@pytest.fixture(scope='session')
def app():
    application = create_app()
    application.config['TESTING'] = True
    with application.app_context():
        db.create_all()
        yield application


@pytest.fixture(scope='session')
def test_clinic(app):
    from app.models.Clinics import Clinic
    clinic = Clinic(
        name='Test Clinic',
        logo_url='https://example.com/logo.png',
        contact_phone='0512345678',
        updated_at=datetime.utcnow(),
    )
    db.session.add(clinic)
    db.session.commit()
    yield clinic
    db.session.delete(clinic)
    db.session.commit()


@pytest.fixture
def make_user_data(test_clinic):
    def _factory(**overrides):
        data = {
            'clinic_id': test_clinic.id,
            'first_name': 'Ahmad',
            'second_name': 'Ali',
            'email': 'ahmad@gmail.com',
            'phone': '0512345678',
            'password': VALID_PASSWORD,
            'role': 'doctor',
            'is_active': False,
            'updated_at': datetime.utcnow(),
        }
        data.update(overrides)
        return data
    return _factory


@pytest.fixture(autouse=True)
def clean_users(app):
    yield
    from app.models.User import Users
    db.session.rollback()
    db.session.query(Users).delete()
    db.session.commit()
