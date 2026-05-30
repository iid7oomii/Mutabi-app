from flask import Blueprint, jsonify, request, g
from app.api.v1.middleware.role_required import role_required
from app.repositories.notification_repository import NotificationRepository
from app.repositories.user_repsitories import UserRepositories

notifications_bp = Blueprint('notifications', __name__, url_prefix='/notifications')


@notifications_bp.route('/device-token', methods=['POST'])
@role_required('Admin', 'Doctor', 'Parent')
def save_device_token():
    """Save FCM device token for the current user."""
    data = request.get_json()
    token = data.get('device_token', '').strip()
    if not token:
        return jsonify({'error': 'device_token is required'}), 400
    user_id = g.jwt_claims['sub']
    UserRepositories.update(user_id, {'device_token': token})
    return jsonify({'message': 'Device token saved'}), 200


@notifications_bp.route('/', methods=['GET'])
@role_required('Admin', 'Doctor', 'Parent')
def get_notifications():
    """Get all notifications for the current user."""
    user_id = g.jwt_claims['sub']
    notifs = NotificationRepository.get_by_user(user_id)
    return jsonify([
        {
            'id': str(n.id),
            'title': n.title,
            'body': n.body,
            'type': n.type,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifs
    ]), 200


@notifications_bp.route('/read-all', methods=['PUT'])
@role_required('Admin', 'Doctor', 'Parent')
def mark_all_read():
    """Mark all notifications as read for the current user."""
    user_id = g.jwt_claims['sub']
    count = NotificationRepository.mark_all_read(user_id)
    return jsonify({'marked': count}), 200


@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
@role_required('Admin', 'Doctor', 'Parent')
def mark_read(notification_id):
    """Mark a single notification as read."""
    user_id = g.jwt_claims['sub']
    success = NotificationRepository.mark_read(notification_id, user_id)
    if not success:
        return jsonify({'error': 'Notification not found'}), 404
    return jsonify({'message': 'Marked as read'}), 200
