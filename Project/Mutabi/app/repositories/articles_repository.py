from app.models.Articls import Articles
from app import db
from typing import List, Optional


class ArticlesRepository:

    @staticmethod
    def create(data: dict) -> Articles:
        article = Articles(**data)
        db.session.add(article)
        db.session.commit()
        return article

    @staticmethod
    def get_all() -> List[Articles]:
        return db.session.query(Articles).order_by(Articles.created_at.desc()).all()

    @staticmethod
    def get_by_id(article_id: str) -> Optional[Articles]:
        return db.session.get(Articles, article_id)

    @staticmethod
    def update(article_id: str, data: dict) -> Optional[Articles]:
        article = db.session.get(Articles, article_id)
        if not article:
            return None
        for key, value in data.items():
            setattr(article, key, value)
        db.session.commit()
        return article

    @staticmethod
    def delete(article_id: str) -> bool:
        article = db.session.get(Articles, article_id)
        if not article:
            return False
        db.session.delete(article)
        db.session.commit()
        return True
