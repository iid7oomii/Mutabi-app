from flask import Blueprint, request, jsonify
from app.integrations.email import ResendEmailClient

contact_bp = Blueprint('contact', __name__, url_prefix='/contact')

@contact_bp.route('/', methods=['POST'])
def submit_contact():
    data = request.get_json()
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    phone = (data.get('phone') or '').strip()
    account_type = data.get('type', 'specialist')
    message = (data.get('message') or '').strip()

    if not name or not email or not phone:
        return jsonify({'error': 'الرجاء تعبئة جميع الحقول المطلوبة'}), 400

    try:
        ResendEmailClient().send_contact_form(name, email, phone, account_type, message)
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء الإرسال'}), 500
