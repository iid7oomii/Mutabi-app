import os
from flask import Blueprint, request, jsonify, g
from app.api.v1.middleware.role_required import role_required
from app.services.subscription_service import SubscriptionService

subscriptions_bp = Blueprint('subscriptions', __name__, url_prefix='/subscriptions')

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')


@subscriptions_bp.route('/plans', methods=['GET'])
def get_plans():
    return jsonify(SubscriptionService.get_plans()), 200


@subscriptions_bp.route('/current', methods=['GET'])
@role_required('Admin', 'Doctor')
def get_current():
    try:
        claims = g.jwt_claims
        result = SubscriptionService.get_current(claims['clinic_id'])
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@subscriptions_bp.route('/checkout', methods=['POST'])
@role_required('Admin')
def checkout():
    try:
        data = request.get_json()
        plan_type = data.get('plan_type')
        if not plan_type:
            return jsonify({'error': 'plan_type مطلوب'}), 400

        claims = g.jwt_claims
        callback_url = f"{FRONTEND_URL}/subscription/callback"

        result = SubscriptionService.create_checkout(
            clinic_id=claims['clinic_id'],
            plan_type=plan_type,
            callback_url=callback_url,
        )
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'خطأ في بوابة الدفع'}), 500


@subscriptions_bp.route('/verify', methods=['GET'])
@role_required('Admin')
def verify():
    try:
        payment_id = request.args.get('payment_id')
        if not payment_id:
            return jsonify({'error': 'payment_id مطلوب'}), 400

        result = SubscriptionService.verify_payment(payment_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'خطأ في التحقق'}), 500


@subscriptions_bp.route('/trial', methods=['POST'])
@role_required('Admin')
def start_trial():
    try:
        claims = g.jwt_claims
        result = SubscriptionService.start_trial(claims['clinic_id'])
        return jsonify(result), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
