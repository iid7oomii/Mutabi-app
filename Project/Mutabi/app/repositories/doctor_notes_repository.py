from app.models.Doctor_Notes import DoctorNotes
from app import db
from typing import List, Optional


class DoctorNotesRepository:

    @staticmethod
    def create(data: dict) -> DoctorNotes:
        note = DoctorNotes(**data)
        db.session.add(note)
        db.session.commit()
        return note

    @staticmethod
    def get_by_id(note_id: str) -> Optional[DoctorNotes]:
        return db.session.get(DoctorNotes, note_id)

    @staticmethod
    def get_by_child(child_id: str) -> List[DoctorNotes]:
        return (
            db.session.query(DoctorNotes)
            .filter_by(child_id=child_id)
            .order_by(DoctorNotes.created_at.desc())
            .all()
        )

    @staticmethod
    def get_latest_by_child(child_id: str) -> Optional[DoctorNotes]:
        return (
            db.session.query(DoctorNotes)
            .filter_by(child_id=child_id)
            .order_by(DoctorNotes.created_at.desc())
            .first()
        )

    @staticmethod
    def update(note_id: str, data: dict) -> Optional[DoctorNotes]:
        note = db.session.get(DoctorNotes, note_id)
        if not note:
            return None
        for key, value in data.items():
            setattr(note, key, value)
        db.session.commit()
        return note

    @staticmethod
    def delete(note_id: str) -> bool:
        note = db.session.get(DoctorNotes, note_id)
        if not note:
            return False
        db.session.delete(note)
        db.session.commit()
        return True