import re
from datetime import date
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from flask import Blueprint, g, jsonify, request
from sqlalchemy import select

from app import db
from app.children.repository import ChildrenRepository
from app.goals.model import Goal, GoalReminderSettings
from app.middleware.role_required import role_required


goals_bp = Blueprint('goals', __name__, url_prefix='/goals')
FREQUENCIES = {'none', 'weekly', 'twice_weekly', 'daily'}
GOAL_CREATE_FIELDS = {'child_id', 'title', 'success_criteria', 'notes', 'start_date', 'end_date', 'reminder_frequency'}
GOAL_EDIT_FIELDS = GOAL_CREATE_FIELDS - {'child_id'}
SETTINGS_FIELDS = {'time', 'timezone', 'enabled'}
DATE_PATTERN = re.compile(r'^\d{4}-\d{2}-\d{2}$')
TIME_PATTERN = re.compile(r'^([01]\d|2[0-3]):[0-5]\d$')


def _error(message, code=400):
    return jsonify({'error': message}), code


def _json_object(allowed_fields, required_fields=()):
    if not request.is_json:
        return None, _error('أرسل بيانات JSON صالحة.')
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, _error('يجب أن تكون البيانات كائن JSON.')
    if set(data) - allowed_fields:
        return None, _error('يتضمن الطلب حقولًا غير مسموحة.')
    if set(required_fields) - set(data):
        return None, _error('بيانات الهدف المطلوبة غير مكتملة.')
    return data, None


def _child_access(child_id, claims, write=False):
    child = ChildrenRepository.get_by_id(child_id)
    if child is None:
        return None, _error('الطفل غير موجود.', 404)
    role = str(claims.get('role', '')).lower()
    user_id = str(claims.get('sub', ''))
    clinic_id = str(claims.get('clinic_id', ''))
    same_clinic = str(child.clinic_id) == clinic_id
    if role == 'admin' and same_clinic:
        return child, None
    if role == 'doctor' and same_clinic and str(child.doctor_id) == user_id:
        return child, None
    if not write and role == 'parent' and str(child.parent_id) == user_id:
        return child, None
    return None, _error('غير مصرح بالوصول إلى أهداف هذا الطفل.', 403)


def _goal_access(goal_id, write=False):
    goal = db.session.get(Goal, goal_id)
    if goal is None:
        return None, _error('الهدف غير موجود.', 404)
    _, error = _child_access(goal.child_id, g.jwt_claims, write=write)
    return goal, error


def _parse_date(value):
    if not isinstance(value, str) or not DATE_PATTERN.fullmatch(value):
        raise ValueError('التاريخ يجب أن يكون بصيغة YYYY-MM-DD.')
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError('التاريخ غير صالح.') from exc


def _validated_goal_fields(data, original=None):
    values = {}
    for field, limit in (('title', 160), ('success_criteria', 300)):
        if field in data:
            value = data[field]
            if not isinstance(value, str) or not value.strip() or len(value.strip()) > limit:
                raise ValueError(f'{field} يجب أن يكون نصًا غير فارغ لا يتجاوز {limit} حرفًا.')
            values[field] = value.strip()
    if 'notes' in data:
        value = data['notes']
        if value is not None and (not isinstance(value, str) or len(value) > 2000):
            raise ValueError('الملاحظات يجب أن تكون نصًا لا يتجاوز 2000 حرف.')
        values['notes'] = value.strip() or None if isinstance(value, str) else None
    for field in ('start_date', 'end_date'):
        if field in data:
            values[field] = _parse_date(data[field])
    start = values.get('start_date', original.start_date if original else None)
    end = values.get('end_date', original.end_date if original else None)
    if start is None or end is None or end < start:
        raise ValueError('تاريخ النهاية يجب أن يكون في تاريخ البداية أو بعده.')
    if 'reminder_frequency' in data:
        frequency = data['reminder_frequency']
        if not isinstance(frequency, str) or frequency not in FREQUENCIES:
            raise ValueError('تكرار التذكير غير صالح.')
        values['reminder_frequency'] = frequency
    return values


@goals_bp.get('/child/<child_id>')
@role_required('Admin', 'Doctor', 'Parent')
def list_goals(child_id):
    _, error = _child_access(child_id, g.jwt_claims)
    if error:
        return error
    goals = db.session.scalars(
        select(Goal).where(Goal.child_id == child_id).order_by(Goal.created_at.desc(), Goal.id.desc())
    ).all()
    return jsonify([goal.to_dict() for goal in goals]), 200


@goals_bp.post('/')
@role_required('Admin', 'Doctor')
def create_goal():
    data, error = _json_object(GOAL_CREATE_FIELDS, GOAL_CREATE_FIELDS - {'notes'})
    if error:
        return error
    child_id = data['child_id']
    if not isinstance(child_id, str) or not child_id.strip():
        return _error('اختر الطفل أولًا.')
    _, error = _child_access(child_id, g.jwt_claims, write=True)
    if error:
        return error
    try:
        values = _validated_goal_fields(data)
    except ValueError as exc:
        return _error(str(exc))
    goal = Goal(child_id=child_id.strip(), created_by=str(g.jwt_claims['sub']), status='active', **values)
    db.session.add(goal)
    db.session.commit()
    return jsonify(goal.to_dict()), 201


@goals_bp.patch('/<goal_id>')
@role_required('Admin', 'Doctor')
def edit_goal(goal_id):
    goal, error = _goal_access(goal_id, write=True)
    if error:
        return error
    data, error = _json_object(GOAL_EDIT_FIELDS)
    if error:
        return error
    if not data:
        return _error('لا توجد تعديلات.')
    try:
        values = _validated_goal_fields(data, goal)
    except ValueError as exc:
        return _error(str(exc))
    for field, value in values.items():
        setattr(goal, field, value)
    db.session.commit()
    return jsonify(goal.to_dict()), 200


def _change_status(goal_id, new_status):
    goal, error = _goal_access(goal_id, write=True)
    if error:
        return error
    data, error = _json_object(set())
    if error:
        return error
    if goal.status in {'completed', 'closed'} and goal.status != new_status:
        return _error('الهدف مغلق بالفعل.', 409)
    goal.status = new_status
    db.session.commit()
    return jsonify(goal.to_dict()), 200


@goals_bp.post('/<goal_id>/complete')
@role_required('Admin', 'Doctor')
def complete_goal(goal_id):
    return _change_status(goal_id, 'completed')


@goals_bp.post('/<goal_id>/close')
@role_required('Admin', 'Doctor')
def close_goal(goal_id):
    return _change_status(goal_id, 'closed')


def _settings_for(user_id):
    return db.session.scalar(select(GoalReminderSettings).where(GoalReminderSettings.user_id == user_id))


def _settings_dict(settings):
    if settings is None:
        return {'time': '16:00', 'timezone': 'Asia/Riyadh', 'enabled': True}
    return {'time': settings.time, 'timezone': settings.timezone, 'enabled': settings.enabled}


@goals_bp.get('/reminder-settings')
@role_required('Parent')
def get_reminder_settings():
    return jsonify(_settings_dict(_settings_for(str(g.jwt_claims['sub'])))), 200


@goals_bp.put('/reminder-settings')
@role_required('Parent')
def update_reminder_settings():
    data, error = _json_object(SETTINGS_FIELDS)
    if error:
        return error
    if not data:
        return _error('لا توجد تعديلات.')
    if 'time' in data and (not isinstance(data['time'], str) or not TIME_PATTERN.fullmatch(data['time'])):
        return _error('وقت التذكير يجب أن يكون بصيغة HH:MM.')
    if 'enabled' in data and not isinstance(data['enabled'], bool):
        return _error('enabled يجب أن تكون قيمة منطقية.')
    if 'timezone' in data:
        zone = data['timezone']
        if not isinstance(zone, str) or len(zone) > 255:
            return _error('المنطقة الزمنية غير صالحة.')
        try:
            ZoneInfo(zone)
        except (ZoneInfoNotFoundError, ValueError):
            return _error('المنطقة الزمنية غير صالحة.')
    user_id = str(g.jwt_claims['sub'])
    settings = _settings_for(user_id)
    if settings is None:
        settings = GoalReminderSettings(user_id=user_id)
        db.session.add(settings)
    for field, value in data.items():
        setattr(settings, field, value)
    db.session.commit()
    return jsonify(_settings_dict(settings)), 200
