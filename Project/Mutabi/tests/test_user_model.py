import pytest
from app.models.User import Users
from app.models.EnumUsers import RoleUser
from app.models.EnumRelationship import RelationshipType

VALID_PASSWORD = 'Passw0rd!'


class TestNameValidation:
    def test_valid_names_are_accepted(self, app):
        user = Users(first_name='Ahmad', second_name='Ali')
        assert user.first_name == 'Ahmad'
        assert user.second_name == 'Ali'

    def test_empty_first_name_raises(self, app):
        with pytest.raises(TypeError, match="must not be empty"):
            Users(first_name='   ')

    def test_empty_second_name_raises(self, app):
        with pytest.raises(TypeError, match="must not be empty"):
            Users(second_name='')

    def test_first_name_at_limit_raises(self, app):
        with pytest.raises(TypeError, match="50 charchter or less"):
            Users(first_name='A' * 50)

    def test_second_name_at_limit_raises(self, app):
        with pytest.raises(TypeError, match="50 charchter or less"):
            Users(second_name='B' * 50)


class TestEmailValidation:
    def test_valid_email_is_accepted(self, app):
        user = Users(email='test@gmail.com')
        assert user.email == 'test@gmail.com'

    def test_email_is_normalized_to_lowercase(self, app):
        user = Users(email='TEST@gmail.com')
        assert user.email == 'test@gmail.com'

    def test_email_is_stripped(self, app):
        user = Users(email='  test@gmail.com  ')
        assert user.email == 'test@gmail.com'

    def test_empty_email_raises(self, app):
        with pytest.raises(ValueError, match="must not be empty"):
            Users(email='   ')

    def test_invalid_email_format_raises(self, app):
        with pytest.raises(ValueError, match="Invalid email format"):
            Users(email='not-an-email')

    def test_disallowed_domain_raises(self, app):
        with pytest.raises(ValueError, match="not allowed"):
            Users(email='user@unknown.com')

    def test_email_too_long_raises(self, app):
        with pytest.raises(ValueError, match="less than 255"):
            Users(email='a' * 250 + '@gmail.com')

    def test_allowed_domains_are_accepted(self, app):
        for domain in ['gmail.com', 'yahoo.com', 'icloud.com', 'hotmail.com']:
            user = Users(email=f'user@{domain}')
            assert f'@{domain}' in user.email


class TestPhoneValidation:
    def test_valid_phone_starting_with_05(self, app):
        user = Users(phone='0512345678')
        assert user.phone == '0512345678'

    def test_valid_phone_with_plus_966(self, app):
        user = Users(phone='+966512345678')
        assert user.phone == '+966512345678'

    def test_valid_phone_with_00966(self, app):
        user = Users(phone='00966512345678')
        assert user.phone == '00966512345678'

    def test_empty_phone_raises(self, app):
        with pytest.raises(ValueError, match="must be not empty"):
            Users(phone='')

    def test_invalid_phone_format_raises(self, app):
        with pytest.raises(ValueError, match="Invalid phone number format"):
            Users(phone='1234567890')

    def test_phone_with_wrong_prefix_raises(self, app):
        with pytest.raises(ValueError, match="Invalid phone number format"):
            Users(phone='0412345678')


class TestPasswordValidation:
    def test_valid_password_is_hashed(self, app):
        user = Users(password=VALID_PASSWORD)
        assert user.password != VALID_PASSWORD
        assert user.password.startswith('$2b$')

    def test_empty_password_raises(self, app):
        with pytest.raises(ValueError, match="must not be empty"):
            Users(password='')

    def test_short_password_raises(self, app):
        with pytest.raises(ValueError, match="at least 8 characters"):
            Users(password='Ab1!')

    def test_no_uppercase_raises(self, app):
        with pytest.raises(ValueError, match="uppercase"):
            Users(password='passw0rd!')

    def test_no_lowercase_raises(self, app):
        with pytest.raises(ValueError, match="lowercase"):
            Users(password='PASSW0RD!')

    def test_no_digit_raises(self, app):
        with pytest.raises(ValueError, match="one number"):
            Users(password='Password!')

    def test_no_special_char_raises(self, app):
        with pytest.raises(ValueError, match="special character"):
            Users(password='Passw0rd')


class TestRoleValidation:
    def test_valid_role_string(self, app):
        user = Users(role='doctor')
        assert user.role == 'doctor'

    def test_valid_role_enum_member(self, app):
        user = Users(role=RoleUser.Admin)
        assert user.role == RoleUser.Admin

    def test_all_valid_roles_accepted(self, app):
        for role in ['admin', 'parent', 'doctor']:
            user = Users(role=role)
            assert user.role == role

    def test_invalid_role_raises(self, app):
        with pytest.raises(ValueError, match="Invalid role"):
            Users(role='superuser')


class TestSpecialtyValidation:
    def test_valid_specialty(self, app):
        user = Users(specialty='Pediatrics')
        assert user.specialty == 'Pediatrics'

    def test_empty_specialty_raises(self, app):
        with pytest.raises(ValueError, match="must not be empty"):
            Users(specialty='')

    def test_non_string_specialty_raises(self, app):
        with pytest.raises(TypeError, match="must be string"):
            Users(specialty=123)

    def test_specialty_too_long_raises(self, app):
        with pytest.raises(ValueError, match="less than 255"):
            Users(specialty='A' * 256)


class TestRelationshipTypeValidation:
    def test_none_is_allowed(self, app):
        user = Users(relationship_type=None)
        assert user.relationship_type is None

    def test_valid_relationship_string(self, app):
        user = Users(relationship_type='mother')
        assert user.relationship_type == 'mother'

    def test_valid_relationship_enum_member(self, app):
        user = Users(relationship_type=RelationshipType.FATHER)
        assert user.relationship_type == RelationshipType.FATHER

    def test_all_valid_relationships_accepted(self, app):
        for rel in ['mother', 'father', 'guardian', 'therapist', 'doctor', 'other']:
            user = Users(relationship_type=rel)
            assert user.relationship_type == rel

    def test_invalid_relationship_raises(self, app):
        with pytest.raises(ValueError, match="Invalid relationship type"):
            Users(relationship_type='sibling')


class TestIsActiveValidation:
    def test_true_is_valid(self, app):
        user = Users(is_active=True)
        assert user.is_active is True

    def test_false_is_valid(self, app):
        user = Users(is_active=False)
        assert user.is_active is False

    def test_none_raises(self, app):
        with pytest.raises(ValueError, match="cannot be null"):
            Users(is_active=None)

    def test_integer_raises(self, app):
        with pytest.raises(TypeError, match="must be a boolean"):
            Users(is_active=1)

    def test_string_raises(self, app):
        with pytest.raises(TypeError, match="must be a boolean"):
            Users(is_active='true')
