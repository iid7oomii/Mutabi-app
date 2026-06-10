import os
import requests
from datetime import datetime, timedelta
from app.models.Subscription import PLANS
from app.repositories.subscription_repository import SubscriptionRepository
from app.repositories.user_repsitories import UserRepositories
from app.repositories.children_repository import ChildrenRepository
from app.models.EnumUsers import RoleUser

MOYASAR_API_URL = 'https://api.moyasar.com/v1'


def _moyasar_auth():
    return (os.environ.get('MOYASAR_SECRET_KEY', ''), '')


class SubscriptionService:

    @staticmethod
    def get_plans() -> list:
        result = []
        for key, plan in PLANS.items():
            result.append({
                'plan_type': key,
                **plan,
            })
        return result

    @staticmethod
    def start_trial(clinic_id: str, plan_type: str = 'clinic') -> dict:
        if plan_type not in ('specialist', 'clinic'):
            raise ValueError(f'لا تتوفر تجربة مجانية لباقة {plan_type}')

        existing = SubscriptionRepository.get_active_by_clinic(clinic_id)
        if existing:
            return existing.to_dict()

        now = datetime.utcnow()
        sub = SubscriptionRepository.create({
            'clinic_id': clinic_id,
            'plan_type': plan_type,
            'status': 'trial',
            'starts_at': now,
            'expires_at': now + timedelta(days=30),
        })
        return sub.to_dict()

    @staticmethod
    def get_current(clinic_id: str) -> dict:
        SubscriptionRepository.expire_stale()
        sub = SubscriptionRepository.get_active_by_clinic(clinic_id)
        if not sub:
            latest = SubscriptionRepository.get_latest_by_clinic(clinic_id)
            # Exclude pending-payment records (invoice created but user hasn't paid yet)
            if latest and not (latest.moyasar_payment_id and latest.status == 'trial'):
                plan = PLANS.get(latest.plan_type, {})
                return {**latest.to_dict(), **plan, 'plan_type': latest.plan_type}
            return {'status': 'none'}

        plan = PLANS.get(sub.plan_type, {})
        doctors_used = len(UserRepositories.get_doctors_by_clinic(clinic_id))
        return {
            **sub.to_dict(),
            **plan,
            'plan_type': sub.plan_type,
            'doctors_used': doctors_used,
        }

    @staticmethod
    def create_checkout(clinic_id: str, plan_type: str, callback_url: str) -> dict:
        if plan_type not in PLANS:
            raise ValueError('خطة غير صحيحة')

        plan = PLANS[plan_type]
        description = f"اشتراك {plan['display_name']} - متابع (سنوي)"

        # Use Moyasar Invoices API to get a hosted payment page
        payload = {
            'amount': plan['price_halalas'],
            'currency': 'SAR',
            'description': description,
            'callback_url': callback_url,
            'metadata': {
                'clinic_id': clinic_id,
                'plan_type': plan_type,
            },
        }

        resp = requests.post(
            f'{MOYASAR_API_URL}/invoices',
            json=payload,
            auth=_moyasar_auth(),
            timeout=15,
        )

        if not resp.ok:
            raise ValueError(f'خطأ في بوابة الدفع: {resp.text}')

        data = resp.json()
        invoice_id = data['id']
        payment_url = data.get('url')

        if not payment_url:
            raise ValueError('لم يتم الحصول على رابط الدفع من ميسر')

        pending_sub = SubscriptionRepository.get_by_moyasar_payment_id(invoice_id)
        if not pending_sub:
            now = datetime.utcnow()
            SubscriptionRepository.create({
                'clinic_id': clinic_id,
                'plan_type': plan_type,
                'status': 'trial',
                'starts_at': now,
                'expires_at': now + timedelta(hours=2),
                'moyasar_payment_id': invoice_id,
            })

        return {'payment_id': invoice_id, 'payment_url': payment_url}

    @staticmethod
    def verify_payment(payment_id: str) -> dict:
        # payment_id is the Moyasar PAYMENT ID from the callback ?id= param
        # We need to fetch the payment to get the invoice_id (which we stored in DB)
        resp = requests.get(
            f'{MOYASAR_API_URL}/payments/{payment_id}',
            auth=_moyasar_auth(),
            timeout=15,
        )

        if not resp.ok:
            raise ValueError('تعذر التحقق من الدفع')

        data = resp.json()
        if data.get('status') != 'paid':
            return {'success': False, 'status': data.get('status')}

        # Extract the invoice_id from the payment object
        invoice_id = data.get('invoice_id')
        if not invoice_id:
            raise ValueError('لم يتم العثور على معرف الفاتورة')

        sub = SubscriptionRepository.get_by_moyasar_payment_id(invoice_id)
        if not sub:
            raise ValueError('لم يتم العثور على الاشتراك')

        now = datetime.utcnow()
        SubscriptionRepository.update(sub.id, {
            'status': 'active',
            'starts_at': now,
            'expires_at': now + timedelta(days=365),
        })

        return {'success': True, 'status': 'active'}

    @staticmethod
    def check_doctor_limit(clinic_id: str):
        sub = SubscriptionRepository.get_active_by_clinic(clinic_id)
        if not sub:
            raise ValueError('لا يوجد اشتراك نشط. يرجى الاشتراك لإضافة أطباء.')

        plan = PLANS.get(sub.plan_type, {})
        max_doctors = plan.get('max_doctors', -1)
        if max_doctors == -1:
            return

        current_count = len(UserRepositories.get_by_clinic_and_role(clinic_id, RoleUser.Doctor))
        if current_count >= max_doctors:
            raise ValueError(
                f'وصلت للحد الأقصى للأطباء في باقة {plan["display_name"]} '
                f'({max_doctors} أطباء). يرجى الترقية للإضافة.'
            )

    @staticmethod
    def check_patient_limit(clinic_id: str, doctor_id: str):
        sub = SubscriptionRepository.get_active_by_clinic(clinic_id)
        if not sub:
            raise ValueError('لا يوجد اشتراك نشط. يرجى الاشتراك لإضافة مرضى.')

        plan = PLANS.get(sub.plan_type, {})
        max_patients = plan.get('max_patients_per_doctor', -1)
        if max_patients == -1:
            return

        current_count = ChildrenRepository.count_by_doctor(doctor_id)
        if current_count >= max_patients:
            raise ValueError(
                f'وصل الطبيب للحد الأقصى من المرضى في باقة {plan["display_name"]} '
                f'({max_patients} مريضاً). يرجى الترقية للإضافة.'
            )
