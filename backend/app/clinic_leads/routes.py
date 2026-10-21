from app.clinic_leads.service import ClinicLeadsService
from flask import Blueprint, jsonify, request, g
from app.clinic_leads.n8n_client import N8nClient, N8nClientConfigError
from app.clinic_leads.citys import SUPPORTED_CITIES
import requests


clinic_leads_bp = Blueprint("clinic-leads", __name__, url_prefix="/clinic-leads")


@clinic_leads_bp.get('/cities')
def list_supported_cities():
    return jsonify(SUPPORTED_CITIES), 200


@clinic_leads_bp.route("", methods=["POST"])
def create_clinic_lead():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        n8n_client = N8nClient()
        service = ClinicLeadsService(n8n_client=n8n_client)
        message = service.submit(data)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except N8nClientConfigError:
        return jsonify({"error": "Clinic lead submission is not configured"}), 500
    except requests.RequestException:
        return jsonify({"error": "Failed to submit clinic lead"}), 502
    except RuntimeError:
        return jsonify({"error": "Failed to submit clinic lead"}), 502

    return jsonify({"message": message}), 201
