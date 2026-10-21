from unittest.mock import Mock, patch

from app.clinic_leads.n8n_client import N8nClient, N8nClientConfigError

import pytest

from unittest.mock import Mock, patch

from app.clinic_leads.n8n_client import N8nClient
import requests


def test_send_lead_posts_payload_to_webhook():
    webhook_url = "https://example.com/webhook"
    payload = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
    }

    response = Mock()
    response.raise_for_status.return_value = None

    with patch("app.clinic_leads.n8n_client.requests.post", return_value=response) as post:
        client = N8nClient(webhook_url=webhook_url)

        client.send_lead(payload)

    post.assert_called_once()
    assert post.call_args.args[0] == webhook_url


def test_send_lead_sends_payload_as_json():
    webhook_url = "https://example.com/webhook"
    payload = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
    }

    response = Mock()
    response.raise_for_status.return_value = None

    with patch("app.clinic_leads.n8n_client.requests.post", return_value=response) as post:
        client = N8nClient(webhook_url=webhook_url)

        client.send_lead(payload)

    assert post.call_args.kwargs["json"] == payload


def test_send_lead_uses_timeout():
    webhook_url = "https://example.com/webhook"
    payload = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
    }

    response = Mock()
    response.raise_for_status.return_value = None

    with patch("app.clinic_leads.n8n_client.requests.post", return_value=response) as post:
        client = N8nClient(webhook_url=webhook_url)

        client.send_lead(payload)

    assert post.call_args.kwargs["timeout"] == 10


def test_send_lead_succeeds_when_webhook_returns_2xx():
    webhook_url = "https://example.com/webhook"
    payload = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
    }

    response = Mock()
    response.raise_for_status.return_value = None

    with patch("app.clinic_leads.n8n_client.requests.post", return_value=response):
        client = N8nClient(webhook_url=webhook_url)

        client.send_lead(payload)

    response.raise_for_status.assert_called_once()


def test_send_lead_fails_when_webhook_returns_error_status():
    webhook_url = "https://example.com/webhook"
    payload = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
    }

    response = Mock()
    response.raise_for_status.side_effect = requests.HTTPError("n8n webhook failed")

    with patch("app.clinic_leads.n8n_client.requests.post", return_value=response):
        client = N8nClient(webhook_url=webhook_url)

        with pytest.raises(requests.HTTPError, match="n8n webhook failed"):
            client.send_lead(payload)


def test_send_lead_fails_when_request_times_out():
    webhook_url = "https://example.com/webhook"
    payload = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
    }

    with patch(
        "app.clinic_leads.n8n_client.requests.post",
        side_effect=requests.Timeout("n8n webhook timed out"),
    ):
        client = N8nClient(webhook_url=webhook_url)

        with pytest.raises(requests.Timeout, match="n8n webhook timed out"):
            client.send_lead(payload)

def test_send_lead_fails_when_network_error_occurs():
    webhook_url = "https://example.com/webhook"
    payload = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
    }

    with patch(
        "app.clinic_leads.n8n_client.requests.post",
        side_effect=requests.ConnectionError("Could not connect to n8n"),
    ):
        client = N8nClient(webhook_url=webhook_url)

        with pytest.raises(requests.ConnectionError, match="Could not connect to n8n"):
            client.send_lead(payload)

def test_send_lead_fails_when_network_error_occurs():
    webhook_url = "https://example.com/webhook"
    payload = {
        "clinic_name": "Mutabi",
        "contact_name": "Khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
    }

    with patch(
        "app.clinic_leads.n8n_client.requests.post",
        side_effect=requests.ConnectionError("Could not connect to n8n"),
    ):
        client = N8nClient(webhook_url=webhook_url)

        with pytest.raises(requests.ConnectionError, match="Could not connect to n8n"):
            client.send_lead(payload)

def test_send_lead_fails_when_webhook_url_is_missing(monkeypatch):
    monkeypatch.delenv("N8N_WEBHOOK_URL", raising=False)

    with pytest.raises(N8nClientConfigError, match="N8N webhook URL is required"):
        N8nClient()