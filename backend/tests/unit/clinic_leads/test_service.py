import pytest
from unittest.mock import Mock
from app.clinic_leads.service import ClinicLeadsService


def test_submit_rejects_empty_request():
    # VR-07
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    with pytest.raises(ValueError, match="Clinic lead data is required"):
        service.submit({})

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_missing_clinic_name():
    # BR-01 / VR-01
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "contact_name": "Mohammed Al Qhtani",
        "email": "Mohammed@gmail.com",
        "phone": "0502345326",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Clinic name is required"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_clinic_name_shorter_than_2_chars():
    # VR-01
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "m",
        "contact_name": "Mohammed Al Qhtani",
        "email": "Mohammed@gmail.com",
        "phone": "0502345326",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Clinic name must be between 2 and 100 characters"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_clinic_name_longer_than_100_chars():
    # VR-01
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "mmmm" * 100,
        "contact_name": "Mohammed Al Qhtani",
        "email": "Mohammed@gmail.com",
        "phone": "0502345326",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Clinic name must be between 2 and 100 characters"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_trims_clinic_name_but_preserves_internal_spaces():
    # VR-01
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "   m   ",
        "contact_name": "Mohammed Al Qhtani",
        "email": "Mohammed@gmail.com",
        "phone": "0502345326",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Clinic name must be between 2 and 100 characters"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_missing_contact_name():
    # BR-02 / VR-02
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "email": "Mohammed@gmail.com",
        "phone": "0502345326",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Contact name is required"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_contact_name_shorter_than_2_chars():
    # VR-02
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "e",
        "email": "Mohammed@gmail.com",
        "phone": "0502345326",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Contact name must be between 2 and 50 characters"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_contact_name_longer_than_50_chars():
    # VR-02
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "a" * 100,
        "email": "Mohammed@gmail.com",
        "phone": "0502345326",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Contact name must be between 2 and 50 characters"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_missing_email():
    # BR-03 / VR-03
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "phone": "0502345326",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Email is required"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_invalid_email():
    # BR-03 / VR-03
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail",
        "phone": "0502345326",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Email format is invalid"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_email_longer_than_254_chars():
    # VR-03
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com" * 100,
        "phone": "0502345326",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Email must be less than 255 characters"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_accepts_email_with_leading_and_trailing_spaces():
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = valid_data()
    data["email"] = "  khalid@example.com  "

    service.submit(data)

    payload = n8n_client.send_lead.call_args.args[0]
    assert payload["email"] == "khalid@example.com"


def test_submit_rejects_missing_phone():
    # BR-04 / VR-04
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Phone number is required"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_accepts_saudi_mobile_phone_with_spaces_and_hyphens():
    # VR-04
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "phone": "+966 50-123-4567",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    result = service.submit(data)

    assert result == "Your request has been submitted successfully"
    n8n_client.send_lead.assert_called_once()


def test_submit_accepts_saudi_fixed_line_phone():
    # VR-04
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "phone": "+966 11 123 4567",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    result = service.submit(data)

    assert result == "Your request has been submitted successfully"
    n8n_client.send_lead.assert_called_once()


def test_submit_accepts_saudi_unified_number():
    # VR-04
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "phone": "920012345",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    result = service.submit(data)

    assert result == "Your request has been submitted successfully"
    n8n_client.send_lead.assert_called_once()


def test_submit_accepts_saudi_toll_free_number():
    # VR-04
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "phone": "8001234567",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    result = service.submit(data)

    assert result == "Your request has been submitted successfully"
    n8n_client.send_lead.assert_called_once()


def test_submit_rejects_non_saudi_phone():
    # BR-04 / VR-04
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "phone": "+971502758493",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Phone must be a valid Saudi contact number"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_short_public_service_number():
    # BR-04 / VR-04
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "phone": "937",
        "city": "الرياض",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="Phone must be a valid Saudi contact number"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_missing_city():
    # BR-05 / VR-05
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "phone": "+966 50-123-4567",
        "city": "",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="City is required"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_unapproved_city():
    # BR-05 / VR-05
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "phone": "+966 50-123-4567",
        "city": "Dubai",
        "notes": "Please call me on sunday",
    }

    with pytest.raises(ValueError, match="City is not supported"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_rejects_notes_longer_than_1000_chars():
    # VR-06
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "phone": "+966 50-123-4567",
        "city": "الرياض",
        "notes": "a" * 1001,
    }

    with pytest.raises(ValueError, match="Notes must be 1000 characters or fewer"):
        service.submit(data)

    n8n_client.send_lead.assert_not_called()


def test_submit_accepts_without_notes():
    # BR-06 / VR-06
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = {
        "clinic_name": "Mutabi",
        "contact_name": "Mohammed",
        "email": "Mohammed@gmail.com",
        "phone": "+966 50-123-4567",
        "city": "الرياض",
    }

    result = service.submit(data)

    assert result == "Your request has been submitted successfully"
    n8n_client.send_lead.assert_called_once()


def valid_data():
    return {
        "clinic_name": "Mutabi",
        "contact_name": "khalid",
        "email": "khalid@example.com",
        "phone": "+966501234567",
        "city": "الرياض",
        "notes": "Need demo",
    }


def test_submit_sends_valid_lead_to_n8n():
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    service.submit(valid_data())

    n8n_client.send_lead.assert_called_once()


def test_submit_adds_source_automatically():
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    service.submit(valid_data())

    payload = n8n_client.send_lead.call_args.args[0]
    assert payload["source"] == "website"


def test_submit_adds_submitted_at_automatically():
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    service.submit(valid_data())

    payload = n8n_client.send_lead.call_args.args[0]
    assert "submitted_at" in payload
    assert payload["submitted_at"]


def test_submit_does_not_allow_user_to_override_source():
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = valid_data()
    data["source"] = "hacked"

    service.submit(data)

    payload = n8n_client.send_lead.call_args.args[0]
    assert payload["source"] == "website"


def test_submit_does_not_allow_user_to_override_submitted_at():
    n8n_client = Mock()
    service = ClinicLeadsService(n8n_client=n8n_client)

    data = valid_data()
    data["submitted_at"] = "2000-01-01T00:00:00Z"

    service.submit(data)

    payload = n8n_client.send_lead.call_args.args[0]
    assert payload["submitted_at"] != "2000-01-01T00:00:00Z"


def test_submit_fails_when_n8n_webhook_fails():
    n8n_client = Mock()
    n8n_client.send_lead.side_effect = RuntimeError("Webhook failed")

    service = ClinicLeadsService(n8n_client=n8n_client)

    with pytest.raises(RuntimeError, match="Webhook failed"):
        service.submit(valid_data())