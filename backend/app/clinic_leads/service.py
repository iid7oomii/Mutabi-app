import re 
from app.clinic_leads.citys import SUPPORTED_CITIES
from app.clinic_leads.n8n_client import N8nClient
from datetime import datetime, timezone

class ClinicLeadsService:

    def __init__(self, n8n_client):
        self.n8n_client = n8n_client

    def submit(self, data: dict) -> dict:
        if not data:
            raise ValueError("Clinic lead data is required")

        clinic_name = data.get("clinic_name")

        if not isinstance(clinic_name, str) or not clinic_name.strip():
            raise ValueError("Clinic name is required")

        clinic_name = clinic_name.strip()

        if len(clinic_name) < 2 or len(clinic_name) > 100:
            raise ValueError("Clinic name must be between 2 and 100 characters")

        contact_name = data.get("contact_name")

        if not isinstance(contact_name, str) or not contact_name.strip():
            raise ValueError("Contact name is required")

        contact_name = contact_name.strip()

        if len(contact_name) < 2 or len(contact_name) > 50:
            raise ValueError("Contact name must be between 2 and 50 characters")

        email = data.get("email")

        if not isinstance(email, str) or not email.strip():
            raise ValueError("Email is required")

        email = email.strip()

        if len(email) > 254:
            raise ValueError("Email must be less than 255 characters")

        EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

        if not re.match(EMAIL_PATTERN, email):
            raise ValueError("Email format is invalid")

        phone = data.get("phone")

        if not isinstance(phone, str) or not phone.strip():
            raise ValueError("Phone number is required")

        SAUDI_PHONE_PATTERNS = [
            r"^05\d{8}$",        
            r"^5\d{8}$",         
            r"^\+9665\d{8}$",    
            r"^9665\d{8}$",
            r"^009665\d{8}$",

            r"^01[123467]\d{7}$",        
            r"^\+9661[123467]\d{7}$",    
            r"^9661[123467]\d{7}$",
            r"^009661[123467]\d{7}$",

            r"^9200\d{5}$",          
            r"^\+9669200\d{5}$",
            r"^9669200\d{5}$",
            r"^009669200\d{5}$",

            r"^800\d{7}$",          
            r"^\+966800\d{7}$",
            r"^966800\d{7}$",
            r"^00966800\d{7}$",
        ]

        clean_phone = phone.strip().replace(" ", "").replace("-", "")

        if not any(re.fullmatch(pattern, clean_phone) for pattern in SAUDI_PHONE_PATTERNS):
            raise ValueError("Phone must be a valid Saudi contact number")


        city = data.get("city")

        if not isinstance(city, str) or not city.strip():
            raise ValueError("City is required")

        city = data.get("city").strip()

        if city not in SUPPORTED_CITIES:
            raise ValueError("City is not supported")

        notes = data.get("notes")

        if notes is not None and len(notes) > 1000:
            raise ValueError("Notes must be 1000 characters or fewer")

        payload = {
            "clinic_name": clinic_name,
            "contact_name": contact_name,
            "email": email,
            "phone": clean_phone,
            "city": city,
            "notes": notes,
            "source": "website",
            "submitted_at": datetime.now(timezone.utc).isoformat(),
        }

        self.n8n_client.send_lead(payload)

        return "Your request has been submitted successfully"


        