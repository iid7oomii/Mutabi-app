import pytest
import uuid
from app import db
from Project.Mutabi.app.repositories.user_repsitories import UserRepositories
from app.models.User import Users
from app.models.EnumUsers import RoleUser
from app.models.EnumRelationship import RelationshipType

VALID_PASSWORD = 'Passw0rd!'


class TestGetAll:
    def test_empty_db_returns_empty_list(self, app):
        assert UserRepositories.get_all() == []

    def test_returns_all_created_users(self, app, make_user_data):
        UserRepositories.create(make_user_data(email='u1@gmail.com'))
        UserRepositories.create(make_user_data(email='u2@gmail.com'))
        assert len(UserRepositories.get_all()) == 2

    def test_returns_users_instances(self, app, make_user_data):
        UserRepositories.create(make_user_data())
        result = UserRepositories.get_all()
        assert all(isinstance(u, Users) for u in result)


class TestGetById:
    def test_existing_id_returns_user(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        found = UserRepositories.get_by_id(user.id)
        assert found is not None
        assert found.id == user.id

    def test_non_existing_id_returns_none(self, app):
        assert UserRepositories.get_by_id(str(uuid.uuid4())) is None


class TestGetByEmail:
    def test_existing_email_returns_user(self, app, make_user_data):
        UserRepositories.create(make_user_data(email='find@gmail.com'))
        found = UserRepositories.get_by_email('find@gmail.com')
        assert found is not None
        assert found.email == 'find@gmail.com'

    def test_lookup_is_case_insensitive(self, app, make_user_data):
        UserRepositories.create(make_user_data(email='case@gmail.com'))
        assert UserRepositories.get_by_email('CASE@gmail.com') is not None

    def test_lookup_strips_whitespace(self, app, make_user_data):
        UserRepositories.create(make_user_data(email='strip@gmail.com'))
        assert UserRepositories.get_by_email('  strip@gmail.com  ') is not None

    def test_non_existing_email_returns_none(self, app):
        assert UserRepositories.get_by_email('ghost@gmail.com') is None


class TestGetByRole:
    def test_returns_users_with_matching_role(self, app, make_user_data):
        UserRepositories.create(make_user_data(email='doc@gmail.com', role='doctor'))
        UserRepositories.create(make_user_data(email='par@gmail.com', role='parent'))

        doctors = UserRepositories.get_by_role(RoleUser.Doctor)
        parents = UserRepositories.get_by_role(RoleUser.Parent)

        assert len(doctors) == 1
        assert len(parents) == 1

    def test_no_users_with_role_returns_empty(self, app):
        assert UserRepositories.get_by_role(RoleUser.Admin) == []

    def test_does_not_return_other_roles(self, app, make_user_data):
        UserRepositories.create(make_user_data(role='doctor'))
        assert UserRepositories.get_by_role(RoleUser.Parent) == []


class TestGetByClinic:
    def test_returns_users_for_specific_clinic(self, app, make_user_data, test_clinic):
        other_clinic_id = str(uuid.uuid4())
        UserRepositories.create(make_user_data(email='u1@gmail.com'))
        UserRepositories.create(make_user_data(email='u2@gmail.com', clinic_id=other_clinic_id))

        result = UserRepositories.get_by_clinic(test_clinic.id)
        assert len(result) == 1
        assert result[0].clinic_id == test_clinic.id

    def test_unknown_clinic_returns_empty(self, app):
        assert UserRepositories.get_by_clinic(str(uuid.uuid4())) == []


class TestGetActiveUsers:
    def test_returns_only_active_users(self, app, make_user_data):
        UserRepositories.create(make_user_data(email='active@gmail.com', is_active=True))
        UserRepositories.create(make_user_data(email='inactive@gmail.com', is_active=False))

        result = UserRepositories.get_active_users()
        assert len(result) == 1
        assert result[0].is_active is True

    def test_no_active_users_returns_empty(self, app, make_user_data):
        UserRepositories.create(make_user_data(is_active=False))
        assert UserRepositories.get_active_users() == []


class TestGetDoctorsByClinic:
    def test_returns_active_doctors_only(self, app, make_user_data, test_clinic):
        UserRepositories.create(make_user_data(email='active_doc@gmail.com', role='doctor', is_active=True))
        UserRepositories.create(make_user_data(email='inactive_doc@gmail.com', role='doctor', is_active=False))
        UserRepositories.create(make_user_data(email='active_par@gmail.com', role='parent', is_active=True))

        result = UserRepositories.get_doctors_by_clinic(test_clinic.id)
        assert len(result) == 1
        assert result[0].email == 'active_doc@gmail.com'

    def test_no_doctors_returns_empty(self, app, test_clinic):
        assert UserRepositories.get_doctors_by_clinic(test_clinic.id) == []


class TestGetParentsByClinic:
    def test_returns_active_parents_only(self, app, make_user_data, test_clinic):
        UserRepositories.create(make_user_data(email='active_par@gmail.com', role='parent', is_active=True))
        UserRepositories.create(make_user_data(email='inactive_par@gmail.com', role='parent', is_active=False))
        UserRepositories.create(make_user_data(email='active_doc@gmail.com', role='doctor', is_active=True))

        result = UserRepositories.get_parents_by_clinic(test_clinic.id)
        assert len(result) == 1
        assert result[0].email == 'active_par@gmail.com'

    def test_no_parents_returns_empty(self, app, test_clinic):
        assert UserRepositories.get_parents_by_clinic(test_clinic.id) == []


class TestCreate:
    def test_creates_and_returns_user(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        assert user is not None
        assert user.id is not None
        assert user.email == 'ahmad@gmail.com'

    def test_password_is_hashed_on_create(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        assert user.password != VALID_PASSWORD
        assert user.password.startswith('$2b$')

    def test_created_user_is_persisted(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        fetched = UserRepositories.get_by_id(user.id)
        assert fetched is not None
        assert fetched.email == user.email


class TestUpdate:
    def test_updates_allowed_fields(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        updated = UserRepositories.update(user.id, {'first_name': 'Mohammed', 'phone': '0598765432'})
        assert updated is not None
        assert updated.first_name == 'Mohammed'
        assert updated.phone == '0598765432'

    def test_update_is_persisted(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        UserRepositories.update(user.id, {'first_name': 'Khalid'})
        db.session.expire_all()
        refreshed = UserRepositories.get_by_id(user.id)
        assert refreshed.first_name == 'Khalid'

    def test_update_non_existing_returns_none(self, app):
        assert UserRepositories.update(str(uuid.uuid4()), {'first_name': 'X'}) is None


class TestDelete:
    def test_deletes_existing_user_and_returns_true(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        result = UserRepositories.delete(user.id)
        assert result is True

    def test_deleted_user_is_not_found(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        UserRepositories.delete(user.id)
        assert UserRepositories.get_by_id(user.id) is None

    def test_delete_non_existing_returns_false(self, app):
        assert UserRepositories.delete(str(uuid.uuid4())) is False


class TestActivate:
    def test_activates_inactive_user(self, app, make_user_data):
        user = UserRepositories.create(make_user_data(is_active=False))
        activated = UserRepositories.activate(user.id)
        assert activated is not None
        assert activated.is_active is True

    def test_activate_persists_change(self, app, make_user_data):
        user = UserRepositories.create(make_user_data(is_active=False))
        UserRepositories.activate(user.id)
        db.session.expire_all()
        refreshed = UserRepositories.get_by_id(user.id)
        assert refreshed.is_active is True

    def test_activate_non_existing_returns_none(self, app):
        assert UserRepositories.activate(str(uuid.uuid4())) is None


class TestDeactivate:
    def test_deactivates_active_user(self, app, make_user_data):
        user = UserRepositories.create(make_user_data(is_active=True))
        deactivated = UserRepositories.deactivate(user.id)
        assert deactivated is not None
        assert deactivated.is_active is False

    def test_deactivate_persists_change(self, app, make_user_data):
        user = UserRepositories.create(make_user_data(is_active=True))
        UserRepositories.deactivate(user.id)
        db.session.expire_all()
        refreshed = UserRepositories.get_by_id(user.id)
        assert refreshed.is_active is False

    def test_deactivate_non_existing_returns_none(self, app):
        assert UserRepositories.deactivate(str(uuid.uuid4())) is None


class TestVerifyPassword:
    def test_correct_password_returns_true(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        assert UserRepositories.verify_password(user, VALID_PASSWORD) is True

    def test_wrong_password_returns_false(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        assert UserRepositories.verify_password(user, 'WrongPass1!') is False

    def test_empty_password_returns_false(self, app, make_user_data):
        user = UserRepositories.create(make_user_data())
        assert UserRepositories.verify_password(user, '') is False


class TestEmailExists:
    def test_existing_email_returns_true(self, app, make_user_data):
        UserRepositories.create(make_user_data(email='exists@gmail.com'))
        assert UserRepositories.email_exists('exists@gmail.com') is True

    def test_non_existing_email_returns_false(self, app):
        assert UserRepositories.email_exists('ghost@gmail.com') is False

    def test_check_is_case_insensitive(self, app, make_user_data):
        UserRepositories.create(make_user_data(email='case@gmail.com'))
        assert UserRepositories.email_exists('CASE@gmail.com') is True

    def test_check_strips_whitespace(self, app, make_user_data):
        UserRepositories.create(make_user_data(email='strip@gmail.com'))
        assert UserRepositories.email_exists('  strip@gmail.com  ') is True


class TestRelationshipLogicEvent:
    def test_other_with_custom_relationship_is_valid(self, app, make_user_data):
        user = UserRepositories.create(make_user_data(
            relationship_type='other',
            custom_relationship='Uncle',
        ))
        assert user.custom_relationship == 'Uncle'

    def test_other_without_custom_relationship_raises(self, app, make_user_data):
        with pytest.raises(ValueError, match="Custom relationship must be specified"):
            UserRepositories.create(make_user_data(relationship_type='other'))

    def test_non_other_relationship_clears_custom(self, app, make_user_data):
        user = UserRepositories.create(make_user_data(
            relationship_type='mother',
            custom_relationship='should be cleared',
        ))
        assert user.custom_relationship is None

    def test_no_relationship_type_clears_custom(self, app, make_user_data):
        user = UserRepositories.create(make_user_data(custom_relationship='ignored'))
        assert user.custom_relationship is None
