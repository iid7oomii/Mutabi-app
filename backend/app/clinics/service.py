from app.clinics.repository import ClinicRepository
from app.clinics.model import Clinic
class ClinicService:
    
    @staticmethod
    def create(data: dict) -> Clinic:
        return ClinicRepository.create(data)
