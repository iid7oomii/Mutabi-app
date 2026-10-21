"""
ExpoPushClient
==============
Sends push notifications via Expo's Push API (https://exp.host/--/api/v2/push/send).
Works with both Expo Go (ExponentPushToken) and standalone builds.
"""

import requests


EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


class FCMNotificationClient:
    """Push notification client — uses Expo Push API (works with Expo Go and production builds)."""

    def send(self, device_token: str, title: str, body: str, data: dict = None) -> bool:
        if not device_token:
            return False
        try:
            payload = {
                "to": device_token,
                "title": title,
                "body": body,
                "sound": "default",
                "data": data or {},
            }
            res = requests.post(
                EXPO_PUSH_URL,
                json=payload,
                headers={
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                },
                timeout=10,
            )
            result = res.json()
            status = result.get("data", {}).get("status") if isinstance(result.get("data"), dict) else None
            if status == "error":
                print(f"[Expo Push] Error: {result['data'].get('message')}")
                return False
            return res.ok
        except Exception as e:
            print(f"[Expo Push] Failed to send notification: {e}")
            return False

    def notify_parent_new_plan(self, device_token: str, child_name: str) -> bool:
        return self.send(
            device_token,
            title="خطة علاجية جديدة",
            body=f"تم تعيين خطة علاجية جديدة لـ {child_name}.",
            data={"type": "new_plan"},
        )

    def notify_parent_feedback_reply(self, device_token: str, doctor_name: str) -> bool:
        return self.send(
            device_token,
            title="رد الدكتور",
            body=f"د. {doctor_name} رد على تقريرك.",
            data={"type": "feedback_reply"},
        )

    def notify_doctor_feedback(self, device_token: str, child_name: str) -> bool:
        return self.send(
            device_token,
            title="تقرير تمارين جديد",
            body=f"ولي أمر {child_name} أرسل تقرير جلسة جديد.",
            data={"type": "feedback_report"},
        )

    def notify_parent_new_note(self, device_token: str, doctor_name: str, child_name: str) -> bool:
        return self.send(
            device_token,
            title="ملاحظة جديدة من الدكتور",
            body=f"د. {doctor_name} أضاف ملاحظة جديدة لـ {child_name}.",
            data={"type": "doctor_note"},
        )

    def notify_parent_new_appointment(self, device_token: str, appt_str: str, child_name: str) -> bool:
        return self.send(
            device_token,
            title="موعد جديد",
            body=f"تم تحديد موعد جديد لـ {child_name} بتاريخ {appt_str}.",
            data={"type": "appointment"},
        )
