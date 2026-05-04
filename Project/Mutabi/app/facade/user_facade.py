from app.repositories.user_repsitories import UserRepositories
from app.models.EnumUsers import RoleUser


class UserFacade:

    @staticmethod
    def get_all(clinic_id: str, role: str = None):
        if role:
            try:
                role_enum = RoleUser(role.lower())
            except ValueError:
                raise ValueError(f"Invalid role: {role}")
            return UserRepositories.get_by_role(role_enum)
        return UserRepositories.get_by_clinic(clinic_id)

    @staticmethod
    def get_parents(clinic_id: str):
        return UserRepositories.get_parents_by_clinic(clinic_id)