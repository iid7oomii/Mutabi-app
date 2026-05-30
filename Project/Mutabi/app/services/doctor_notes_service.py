from app.repositories.doctor_notes_repository import DoctorNotesRepository
from app.repositories.children_repository import ChildrenRepository
from app.repositories.user_repsitories import UserRepositories


class DoctorNotesService:

    @staticmethod
    def create(data: dict) -> dict:
        if not UserRepositories.get_by_id(data["doctor_id"]):
            raise ValueError("Doctor not found")
        if not ChildrenRepository.get_by_id(data["child_id"]):
            raise ValueError("Child not found")

        note = DoctorNotesRepository.create({
            "doctor_id": data["doctor_id"],
            "child_id": data["child_id"],
            "content": data["content"],
        })
        return note.to_dict()

    @staticmethod
    def get_by_child(child_id: str) -> list:
        if not ChildrenRepository.get_by_id(child_id):
            raise ValueError("Child not found")
        return [n.to_dict() for n in DoctorNotesRepository.get_by_child(child_id)]

    @staticmethod
    def get_latest_by_child(child_id: str) -> dict:
        note = DoctorNotesRepository.get_latest_by_child(child_id)
        if not note:
            raise ValueError("No notes found")
        return note.to_dict()

    @staticmethod
    def get_by_id(note_id: str) -> dict:
        note = DoctorNotesRepository.get_by_id(note_id)
        if not note:
            raise ValueError("Note not found")
        return note.to_dict()

    @staticmethod
    def update(note_id: str, data: dict) -> dict:
        note = DoctorNotesRepository.update(note_id, data)
        if not note:
            raise ValueError("Note not found")
        return note.to_dict()

    @staticmethod
    def delete(note_id: str) -> dict:
        deleted = DoctorNotesRepository.delete(note_id)
        if not deleted:
            raise ValueError("Note not found")
        return {"message": "Note deleted successfully"}