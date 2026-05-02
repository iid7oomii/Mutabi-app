"""
Integration Facade — app/integrations
======================================
This package is the single boundary between the Mutabi backend and all
third-party services.  No other layer in the application imports an external
SDK directly; everything goes through one of the four clients defined here.

Clients
-------
S3StorageClient
    Uploads and deletes media files (exercise videos/images, feedback media)
    on Amazon S3.  Returns a public URL that is stored in the database.

FCMNotificationClient
    Sends push notifications to the React Native mobile app via Firebase
    Cloud Messaging.  Used to alert parents about new therapy plans and to
    alert doctors when a parent submits exercise feedback.

SendGridEmailClient
    Sends transactional emails via SendGrid.  Currently used only to deliver
    doctor invitation emails containing a one-time activation token.

TwilioSMSClient
    Sends SMS messages via Twilio.  Currently used only to deliver a welcome
    message and a temporary password to a newly registered parent.

Usage
-----
    from app.integrations import S3StorageClient, FCMNotificationClient
    from app.integrations import SendGridEmailClient, TwilioSMSClient
"""

from .email import SendGridEmailClient
from .notifications import FCMNotificationClient
from .sms import TwilioSMSClient
from .storage import S3StorageClient

__all__ = [
    "S3StorageClient",
    "FCMNotificationClient",
    "SendGridEmailClient",
    "TwilioSMSClient",
]
