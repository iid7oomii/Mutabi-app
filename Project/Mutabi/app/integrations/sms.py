"""
TwilioSMSClient
===============
Wraps the Twilio Python SDK to send SMS messages to parents on behalf of
the Mutabi platform.

Responsibilities
----------------
- Send a welcome onboarding SMS to a parent immediately after their account
  is created by clinic staff.
- The SMS contains a system-generated temporary password that the parent
  uses for their first login via the mobile app.
- After logging in, the parent is expected to change their password through
  the app settings.

Environment variables required
------------------------------
TWILIO_ACCOUNT_SID   — Account SID from the Twilio console.
TWILIO_AUTH_TOKEN    — Auth token from the Twilio console.
TWILIO_PHONE_NUMBER  — Twilio-provisioned sender phone number
                       (must include country code, e.g. +12025551234).

API reference
-------------
Twilio Messages API: POST https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json
"""

import os

from twilio.rest import Client


class TwilioSMSClient:
    """Twilio client for sending SMS messages to parents."""

    def __init__(self):
        self._client = Client(
            os.getenv("TWILIO_ACCOUNT_SID"),
            os.getenv("TWILIO_AUTH_TOKEN"),
        )
        self._from_number = os.getenv("TWILIO_PHONE_NUMBER")

    def send_parent_onboarding(self, to_phone: str, parent_name: str, temp_password: str) -> None:
        """Send a welcome SMS to a new parent containing their temporary password.

        Called immediately after clinic staff registers a new parent and child
        profile via POST /clinic/patients.

        Args:
            to_phone:      Parent's phone number including country code (e.g. +966555555555).
                           This number is also used as the parent's login identifier.
            parent_name:   Parent's full name used for personalisation.
            temp_password: System-generated temporary password (plain text).
                           The parent must change this after their first login.
        """
        body = (
            f"Hello {parent_name}, welcome to Mutabi!\n"
            f"Your temporary password is: {temp_password}\n"
            f"Log in with your phone number and update your password after signing in."
        )
        self._client.messages.create(
            body=body,
            from_=self._from_number,
            to=to_phone,
        )
