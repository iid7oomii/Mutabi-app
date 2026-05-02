"""
FCMNotificationClient
=====================
Wraps the Firebase Cloud Messaging (FCM) legacy HTTP API to send push
notifications to the Mutabi React Native mobile app.

Responsibilities
----------------
- Deliver real-time push notifications to individual devices using their
  FCM registration token.
- Provide two high-level helpers that encode the exact notification events
  defined in the system requirements:
    * notify_parent_new_plan  — triggered when a doctor creates a therapy plan.
    * notify_doctor_feedback  — triggered when a parent submits exercise feedback.

Environment variables required
------------------------------
FCM_SERVER_KEY — Server key obtained from the Firebase project console.

API reference
-------------
Legacy FCM endpoint: POST https://fcm.googleapis.com/fcm/send
Authorization header: key=<FCM_SERVER_KEY>
"""

import os

import requests


class FCMNotificationClient:
    """Firebase Cloud Messaging client for sending push notifications."""

    _URL = "https://fcm.googleapis.com/fcm/send"

    def __init__(self):
        self._headers = {
            "Authorization": f"key={os.getenv('FCM_SERVER_KEY')}",
            "Content-Type": "application/json",
        }

    def send(self, device_token: str, title: str, body: str) -> None:
        """Send a push notification to a single device.

        This is the low-level method.  Prefer the named helpers below when
        the intent is one of the standard application events.

        Args:
            device_token: FCM registration token of the target device.
            title:        Notification title displayed on the device.
            body:         Notification body text displayed on the device.

        Raises:
            requests.HTTPError: If FCM returns a non-2xx response.
        """
        payload = {
            "to": device_token,
            "notification": {"title": title, "body": body},
        }
        response = requests.post(self._URL, json=payload, headers=self._headers, timeout=10)
        response.raise_for_status()

    def notify_parent_new_plan(self, device_token: str, child_name: str) -> None:
        """Notify a parent that the doctor has assigned a new therapy plan.

        Called by the business logic layer immediately after a therapy plan
        is saved to the database.

        Args:
            device_token: FCM token of the parent's mobile device.
            child_name:   Name of the child the plan belongs to.
        """
        self.send(
            device_token,
            title="New Therapy Plan",
            body=f"A new therapy plan has been assigned for {child_name}.",
        )

    def notify_doctor_feedback(self, device_token: str, child_name: str) -> None:
        """Notify a doctor that a parent has submitted exercise feedback.

        Called by the business logic layer immediately after an
        ExerciseFeedback record is saved to the database.

        Args:
            device_token: FCM token of the doctor's device.
            child_name:   Name of the child whose feedback was submitted.
        """
        self.send(
            device_token,
            title="New Exercise Feedback",
            body=f"The parent of {child_name} has submitted a new exercise report.",
        )
