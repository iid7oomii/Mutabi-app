from unittest.mock import Mock, patch
from app.clinic_leads.n8n_client import N8nClientConfigError
from app import create_app
from app.clinic_leads.citys import SUPPORTED_CITIES


def test_list_supported_cities_returns_backend_validation_choices():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    response = app.test_client().get('/api/v1/clinic-leads/cities')
    assert response.status_code == 200
    assert response.get_json() == SUPPORTED_CITIES


def test_create_clinic_lead_returns_201_for_valid_data():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    client = app.test_client()

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
        "notes": "Need demo",
    }

    with patch("app.clinic_leads.routes.N8nClient") as N8nClient, \
         patch("app.clinic_leads.routes.ClinicLeadsService") as Service:
        n8n_client = Mock()
        N8nClient.return_value = n8n_client

        service = Mock()
        service.submit.return_value = "Your request has been submitted successfully"
        Service.return_value = service

        response = client.post("/api/v1/clinic-leads", json=data)

    assert response.status_code == 201


def test_create_clinic_lead_returns_success_message_for_valid_data():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    client = app.test_client()

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
        "notes": "Need demo",
    }

    with patch("app.clinic_leads.routes.N8nClient") as N8nClient, \
         patch("app.clinic_leads.routes.ClinicLeadsService") as Service:
        n8n_client = Mock()
        N8nClient.return_value = n8n_client

        service = Mock()
        service.submit.return_value = "Your request has been submitted successfully"
        Service.return_value = service

        response = client.post("/api/v1/clinic-leads", json=data)

    assert response.get_json() == {
        "message": "Your request has been submitted successfully"
    }


def test_create_clinic_lead_calls_service_with_request_json():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    client = app.test_client()

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
        "notes": "Need demo",
    }

    with patch("app.clinic_leads.routes.N8nClient") as N8nClient, \
         patch("app.clinic_leads.routes.ClinicLeadsService") as Service:
        n8n_client = Mock()
        N8nClient.return_value = n8n_client

        service = Mock()
        service.submit.return_value = "Your request has been submitted successfully"
        Service.return_value = service

        client.post("/api/v1/clinic-leads", json=data)

    service.submit.assert_called_once_with(data)


def test_create_clinic_lead_returns_400_for_validation_error():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    client = app.test_client()

    data = {
        "clinic_name": "",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
        "notes": "Need demo",
    }

    with patch("app.clinic_leads.routes.N8nClient") as N8nClient, \
         patch("app.clinic_leads.routes.ClinicLeadsService") as Service:
        n8n_client = Mock()
        N8nClient.return_value = n8n_client

        service = Mock()
        service.submit.side_effect = ValueError("Clinic name is required")
        Service.return_value = service

        response = client.post("/api/v1/clinic-leads", json=data)

    assert response.status_code == 400


def test_create_clinic_lead_returns_validation_error_message():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    client = app.test_client()

    data = {
        "clinic_name": "",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
        "notes": "Need demo",
    }

    with patch("app.clinic_leads.routes.N8nClient") as N8nClient, \
         patch("app.clinic_leads.routes.ClinicLeadsService") as Service:
        n8n_client = Mock()
        N8nClient.return_value = n8n_client

        service = Mock()
        service.submit.side_effect = ValueError("Clinic name is required")
        Service.return_value = service

        response = client.post("/api/v1/clinic-leads", json=data)

    assert response.get_json() == {
        "error": "Clinic name is required"
    }


def test_create_clinic_lead_returns_400_for_missing_json_body():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    client = app.test_client()

    with patch("app.clinic_leads.routes.N8nClient") as N8nClient, \
         patch("app.clinic_leads.routes.ClinicLeadsService") as Service:
        n8n_client = Mock()
        N8nClient.return_value = n8n_client

        service = Mock()
        Service.return_value = service

        response = client.post("/api/v1/clinic-leads")

    assert response.status_code == 400
    service.submit.assert_not_called()


def test_create_clinic_lead_returns_502_when_n8n_fails():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    client = app.test_client()

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
        "notes": "Need demo",
    }

    with patch("app.clinic_leads.routes.N8nClient") as N8nClient, \
         patch("app.clinic_leads.routes.ClinicLeadsService") as Service:
        n8n_client = Mock()
        N8nClient.return_value = n8n_client

        service = Mock()
        service.submit.side_effect = RuntimeError("Webhook failed")
        Service.return_value = service

        response = client.post("/api/v1/clinic-leads", json=data)

    assert response.status_code == 502


def test_create_clinic_lead_returns_generic_error_when_n8n_fails():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    client = app.test_client()

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
        "notes": "Need demo",
    }

    with patch("app.clinic_leads.routes.N8nClient") as N8nClient, \
         patch("app.clinic_leads.routes.ClinicLeadsService") as Service:
        n8n_client = Mock()
        N8nClient.return_value = n8n_client

        service = Mock()
        service.submit.side_effect = RuntimeError("Webhook failed with secret details")
        Service.return_value = service

        response = client.post("/api/v1/clinic-leads", json=data)

    assert response.status_code == 502
    assert response.get_json() == {
        "error": "Failed to submit clinic lead"
    }


def test_create_clinic_lead_accepts_only_post_method():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    client = app.test_client()

    response = client.get("/api/v1/clinic-leads")

    assert response.status_code == 405


def test_create_clinic_lead_returns_500_when_n8n_is_not_configured():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    client = app.test_client()

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
        "notes": "Need demo",
    }

    with patch("app.clinic_leads.routes.N8nClient") as N8nClient:
        N8nClient.side_effect = N8nClientConfigError("N8N webhook URL is required")

        response = client.post("/api/v1/clinic-leads", json=data)

    assert response.status_code == 500
    assert response.get_json() == {
        "error": "Clinic lead submission is not configured"
    }
