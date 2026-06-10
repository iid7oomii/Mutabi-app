import os
from functools import wraps
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from app.repositories.clinic_repository import ClinicRepository
from app.repositories.user_repsitories import UserRepositories
from app.repositories.children_repository import ChildrenRepository
from app.repositories.subscription_repository import SubscriptionRepository
from app.models.Subscription import PLANS

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def admin_key_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        key = request.headers.get('X-Admin-Key', '')
        expected = os.environ.get('MUTABI_ADMIN_KEY', '')
        if not key or not expected or key != expected:
            return jsonify({'error': 'Unauthorized'}), 401
        return fn(*args, **kwargs)
    return wrapper


# ── Stats ─────────────────────────────────────────────────────────────────────

@admin_bp.route('/stats', methods=['GET'])
@admin_key_required
def get_stats():
    SubscriptionRepository.expire_stale()
    clinics      = ClinicRepository.get_all()
    all_users    = UserRepositories.get_all()
    total_children = ChildrenRepository.count_all()
    active_subs  = SubscriptionRepository.count_by_status('active')
    trial_subs   = SubscriptionRepository.count_by_status('trial')

    roles = {}
    for u in all_users:
        r = u.role.value if hasattr(u.role, 'value') else str(u.role)
        roles[r] = roles.get(r, 0) + 1

    return jsonify({
        'total_clinics':  len(clinics),
        'total_users':    len(all_users),
        'total_patients': total_children,
        'active_subs':    active_subs,
        'trial_subs':     trial_subs,
        'roles':          roles,
    }), 200


# ── Clinics ───────────────────────────────────────────────────────────────────

@admin_bp.route('/clinics', methods=['GET'])
@admin_key_required
def get_clinics():
    SubscriptionRepository.expire_stale()
    clinics = ClinicRepository.get_all()
    result = []
    for clinic in clinics:
        cid = str(clinic.id)
        users    = UserRepositories.get_by_clinic(cid)
        patients = ChildrenRepository.count_by_clinic(cid)
        sub      = SubscriptionRepository.get_active_by_clinic(cid)
        if not sub:
            sub = SubscriptionRepository.get_latest_by_clinic(cid)

        sub_data = None
        if sub:
            sub_data = {
                'status':     sub.status,
                'plan_type':  sub.plan_type,
                'expires_at': sub.expires_at.isoformat() if sub.expires_at else None,
            }

        result.append({
            'id':           cid,
            'name':         clinic.name,
            'logo_url':     clinic.logo_url,
            'contact_phone': clinic.contact_phone,
            'address':      clinic.address,
            'created_at':   clinic.created_at.isoformat() if clinic.created_at else None,
            'user_count':   len(users),
            'patient_count': patients,
            'subscription': sub_data,
        })
    return jsonify(result), 200


@admin_bp.route('/clinics/<clinic_id>', methods=['DELETE'])
@admin_key_required
def delete_clinic(clinic_id):
    ok = ClinicRepository.delete(clinic_id)
    if not ok:
        return jsonify({'error': 'Clinic not found'}), 404
    return jsonify({'success': True}), 200


# ── Users ─────────────────────────────────────────────────────────────────────

@admin_bp.route('/clinics/<clinic_id>/users', methods=['GET'])
@admin_key_required
def get_clinic_users(clinic_id):
    users = UserRepositories.get_by_clinic(clinic_id)
    return jsonify([_user_dict(u) for u in users]), 200


@admin_bp.route('/users/<user_id>', methods=['PUT'])
@admin_key_required
def update_user(user_id):
    data = request.get_json() or {}
    allowed = {'first_name', 'second_name', 'email', 'phone', 'is_active', 'specialty'}
    update  = {k: v for k, v in data.items() if k in allowed}
    if not update:
        return jsonify({'error': 'No valid fields'}), 400
    user = UserRepositories.update(user_id, update)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(_user_dict(user)), 200


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_key_required
def delete_user(user_id):
    ok = UserRepositories.delete(user_id)
    if not ok:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'success': True}), 200


# ── Subscriptions ─────────────────────────────────────────────────────────────

@admin_bp.route('/subscriptions/<clinic_id>', methods=['GET'])
@admin_key_required
def get_clinic_subscriptions(clinic_id):
    subs = SubscriptionRepository.get_all()
    clinic_subs = [s for s in subs if str(s.clinic_id) == clinic_id]
    return jsonify([_sub_dict(s) for s in clinic_subs]), 200


@admin_bp.route('/subscriptions/<clinic_id>', methods=['PUT'])
@admin_key_required
def set_subscription(clinic_id):
    data = request.get_json() or {}
    plan_type = data.get('plan_type')
    status    = data.get('status', 'active')
    days      = int(data.get('days', 365))

    if plan_type and plan_type not in PLANS:
        return jsonify({'error': 'Invalid plan_type'}), 400

    sub = SubscriptionRepository.get_active_by_clinic(clinic_id)
    now = datetime.utcnow()

    if sub:
        update = {'status': status, 'expires_at': now + timedelta(days=days)}
        if plan_type:
            update['plan_type'] = plan_type
        SubscriptionRepository.update(str(sub.id), update)
    else:
        SubscriptionRepository.create({
            'clinic_id':  clinic_id,
            'plan_type':  plan_type or 'clinic',
            'status':     status,
            'starts_at':  now,
            'expires_at': now + timedelta(days=days),
        })

    return jsonify({'success': True}), 200


# ── Helpers ───────────────────────────────────────────────────────────────────

def _user_dict(u) -> dict:
    return {
        'id':          str(u.id),
        'first_name':  u.first_name,
        'second_name': u.second_name,
        'email':       u.email,
        'phone':       u.phone,
        'role':        u.role.value if hasattr(u.role, 'value') else str(u.role),
        'is_active':   u.is_active,
        'specialty':   u.specialty,
        'created_at':  u.created_at.isoformat() if u.created_at else None,
    }


def _sub_dict(s) -> dict:
    return {
        'id':         str(s.id),
        'plan_type':  s.plan_type,
        'status':     s.status,
        'starts_at':  s.starts_at.isoformat() if s.starts_at else None,
        'expires_at': s.expires_at.isoformat() if s.expires_at else None,
    }
