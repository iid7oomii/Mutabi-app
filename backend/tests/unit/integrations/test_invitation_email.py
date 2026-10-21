import pytest

from app.integrations.email import ResendEmailClient


@pytest.mark.parametrize(
    ("method", "name_arg", "password_arg"),
    [
        ("send_parent_invitation", "parent_name", "password"),
        ("send_doctor_invitation", "doctor_name", "temp_password"),
    ],
)
def test_invitation_credentials_are_individually_copyable(
    monkeypatch, method, name_arg, password_arg
):
    sent = []
    monkeypatch.setattr("app.integrations.email.resend.Emails.send", sent.append)
    email = "parent@example.com"
    password = "Ab3!<copy>&"

    getattr(ResendEmailClient(), method)(
        to_email=email,
        **{name_arg: "اسم تجريبي", password_arg: password},
        clinic_name="عيادة تجريبية",
    )

    assert len(sent) == 1
    payload = sent[0]
    assert f"\n{email}\n" in payload["text"]
    assert f"\n{password}\n" in payload["text"]
    assert payload["html"].count('dir="ltr"') == 2
    assert payload["html"].count("user-select: all") == 4
    assert email in payload["html"]
    assert "Ab3!&lt;copy&gt;&amp;" in payload["html"]
    assert "letter-spacing: 2px" not in payload["html"]
