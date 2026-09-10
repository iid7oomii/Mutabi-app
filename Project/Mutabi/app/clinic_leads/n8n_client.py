import os
import requests


class N8nClient:
    def __init__(self, webhook_url=None):
        self.webhook_url = webhook_url or os.environ.get("N8N_WEBHOOK_URL")

        if not self.webhook_url:
            raise N8nClientConfigError("N8N webhook URL is required")

    def send_lead(self, payload):
        response = requests.post(
            self.webhook_url,
            json=payload,
            timeout=10,
        )
        response.raise_for_status()


class N8nClientConfigError(Exception):
    pass