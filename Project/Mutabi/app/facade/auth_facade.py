from datetime import datetime
from app.services.auth_service import AuthService
from app.services.clinic_service import ClinicService
from app.services.subscription_service import SubscriptionService
from app.models.Subscription import PLANS


class AuthFacade:

    @staticmethod
    def admin_signup(data: dict) -> dict:
        clinic = ClinicService.create({
            "name": data["clinic_name"],
            "logo_url": data.get("logo_url", ""),
            "contact_phone": data["contact_phone"],
            "address": data.get("address")
        })

        result = AuthService.signup({
            "clinic_id": str(clinic.id),
            "first_name": data["first_name"],
            "second_name": data["second_name"],
            "email": data["email"],
            "phone": data["phone"],
            "password": data["password"],
        })

        sub = None
        plan_type = data.get('plan_type', 'clinic')
        if plan_type != 'unlimited':
            try:
                sub = SubscriptionService.start_trial(str(clinic.id), plan_type=plan_type)
            except Exception as e:
                print(f"[Subscription] Failed to start trial: {e}")

        try:
            from app.integrations.email import ResendEmailClient
            client = ResendEmailClient()
            admin_name = f"{data['first_name']} {data['second_name']}"

            client.send_welcome_account(
                to_email=data['email'],
                admin_name=admin_name,
                clinic_name=data['clinic_name'],
            )

            if sub:
                plan_name = PLANS.get(plan_type, PLANS.get('clinic', {})).get('display_name', 'العيادة')
                trial_ends = ''
                try:
                    dt = datetime.fromisoformat(str(sub.get('expires_at', '')))
                    trial_ends = dt.strftime('%Y/%m/%d')
                except Exception:
                    trial_ends = str(sub.get('expires_at', ''))

                client.send_welcome_subscription(
                    to_email=data['email'],
                    admin_name=admin_name,
                    clinic_name=data['clinic_name'],
                    plan_name=plan_name,
                    trial_ends=trial_ends,
                )
        except Exception as e:
            print(f"[Email] Failed to send welcome emails: {e}")

        return result

    @staticmethod
    def parent_signup(data: dict) -> dict:
        data["is_active"] = True
        return AuthService.create_parent(data)

    @staticmethod
    def login(email: str, password: str) -> dict:
        return AuthService.login(email, password)

    @staticmethod
    def create_doctor(data: dict) -> dict:
        return AuthService.create_doctor(data)

    @staticmethod
    def create_parent(data: dict) -> dict:
        return AuthService.create_parent(data)

    @staticmethod
    def reset_password(user_id: str, old_password: str, new_password: str) -> dict:
        return AuthService.reset_password(user_id, old_password, new_password)
    
    @staticmethod
    def set_password(user_id: str, tempPassword: str, newPassword: str) -> dict:
        return AuthService.set_password(user_id, tempPassword, newPassword)

    @staticmethod
    def forgot_password(email: str) -> dict:
        return AuthService.forgot_password(email)

    @staticmethod
    def reset_password_by_token(token: str, new_password: str) -> dict:
        return AuthService.reset_password_by_token(token, new_password)