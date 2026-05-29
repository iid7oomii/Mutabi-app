from app import db
from app.models.ChildRequest import ChildRequest, ChildRequestStatus


class ChildRequestRepository:

    @staticmethod
    def create(data: dict) -> ChildRequest:
        req = ChildRequest(**data)
        db.session.add(req)
        db.session.commit()
        return req

    @staticmethod
    def get_by_id(request_id: str) -> ChildRequest | None:
        return db.session.get(ChildRequest, request_id)

    @staticmethod
    def get_by_clinic(clinic_id: str) -> list[ChildRequest]:
        return db.session.query(ChildRequest).filter_by(clinic_id=clinic_id).order_by(ChildRequest.created_at.desc()).all()

    @staticmethod
    def get_by_parent(parent_id: str) -> list[ChildRequest]:
        return db.session.query(ChildRequest).filter_by(parent_id=parent_id).order_by(ChildRequest.created_at.desc()).all()

    @staticmethod
    def update_status(request_id: str, status: ChildRequestStatus, rejection_reason: str = None) -> ChildRequest | None:
        req = db.session.get(ChildRequest, request_id)
        if not req:
            return None
        req.status = status
        if rejection_reason is not None:
            req.rejection_reason = rejection_reason
        db.session.commit()
        return req
