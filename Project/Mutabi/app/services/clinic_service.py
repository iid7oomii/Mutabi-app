from app.repositories.clinic_repository import ClinicRepository
from app.models.Clinics import Clinic
class ClinicService:
    
    @staticmethod
    def create(data: dict) -> Clinic:
        return ClinicRepository.create(data)
