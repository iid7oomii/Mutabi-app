from flask import Blueprint, request, jsonify, g
from app.repositories.articles_repository import ArticlesRepository
from app.api.v1.middleware.role_required import role_required

articles_bp = Blueprint('articles', __name__, url_prefix='/articles')


@articles_bp.route('/', methods=['GET'])
@role_required('Admin', 'Doctor', 'Parent')
def list_articles():
    articles = ArticlesRepository.get_all()
    return jsonify([{
        'id':          a.id,
        'title':       a.title,
        'summary':     a.description,
        'image_url':   a.image_url,
        'article_url': a.article_url,
        'created_at':  a.created_at.isoformat() if a.created_at else None,
    } for a in articles]), 200


@articles_bp.route('/', methods=['POST'])
@role_required('Admin', 'Doctor')
def create_article():
    data = request.get_json()
    if not data.get('title') or not data.get('article_url'):
        return jsonify({'error': 'title and article_url are required'}), 400
    article = ArticlesRepository.create({
        'title':       data['title'],
        'description': data.get('description', ''),
        'image_url':   data.get('image_url'),
        'article_url': data['article_url'],
    })
    return jsonify(article.to_dict()), 201


@articles_bp.route('/<article_id>', methods=['PUT'])
@role_required('Admin', 'Doctor')
def update_article(article_id):
    data = request.get_json()
    article = ArticlesRepository.update(article_id, {
        k: v for k, v in data.items()
        if k in ('title', 'description', 'image_url', 'article_url')
    })
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    return jsonify(article.to_dict()), 200


@articles_bp.route('/<article_id>', methods=['DELETE'])
@role_required('Admin')
def delete_article(article_id):
    if not ArticlesRepository.delete(article_id):
        return jsonify({'error': 'Article not found'}), 404
    return jsonify({'message': 'Deleted'}), 200
