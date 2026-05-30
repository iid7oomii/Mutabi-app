from flask import Blueprint, request, jsonify, g
from app import db
from app.api.v1.middleware.role_required import role_required
from app.integrations.storage import S3StorageClient
from app.models.Clinics import Clinic
from app.repositories.user_repsitories import UserRepositories

upload_bp = Blueprint('upload', __name__, url_prefix='/upload')

ALLOWED_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm'
}
IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp'}

@upload_bp.route('/media', methods=['POST'])
@role_required('Admin', 'Doctor', 'Parent')
def upload_media():
    """
    Upload Media File
    ---
    tags:
      - Upload
    security:
      - Bearer: []
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: file
        type: file
        required: true
      - in: formData
        name: folder
        type: string
        required: true
        enum: [exercises, feedback]
    responses:
      200:
        description: File uploaded successfully
      400:
        description: Invalid file or folder
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        folder = request.form.get('folder', 'uploads')

        if folder not in ('exercises', 'feedback'):
            return jsonify({'error': 'Invalid folder'}), 400

        content_type = file.content_type
        if content_type not in ALLOWED_TYPES:
            return jsonify({'error': 'File type not allowed'}), 400

        client = S3StorageClient()
        url = client.upload(file, folder, content_type)

        return jsonify({'url': url}), 200
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/avatar', methods=['POST'])
@role_required('Admin', 'Doctor', 'Parent')
def upload_my_avatar():
    """Upload profile picture for the current user."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.content_type not in IMAGE_TYPES:
            return jsonify({'error': 'Only JPEG, PNG, or WebP images allowed'}), 400
        client = S3StorageClient()
        url = client.upload(file, 'avatars', file.content_type)
        UserRepositories.update(g.jwt_claims['sub'], {'profile_picture_url': url})
        return jsonify({'url': url}), 200
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@upload_bp.route('/avatar/<user_id>', methods=['POST'])
@role_required('Admin')
def upload_user_avatar(user_id):
    """Admin uploads profile picture for a specific user (doctor)."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.content_type not in IMAGE_TYPES:
            return jsonify({'error': 'Only JPEG, PNG, or WebP images allowed'}), 400
        user = UserRepositories.get_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        client = S3StorageClient()
        url = client.upload(file, 'avatars', file.content_type)
        UserRepositories.update(user_id, {'profile_picture_url': url})
        return jsonify({'url': url}), 200
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@upload_bp.route('/clinic-logo', methods=['POST'])
@role_required('Admin')
def upload_clinic_logo():
    """Admin uploads clinic logo."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.content_type not in IMAGE_TYPES:
            return jsonify({'error': 'Only JPEG, PNG, or WebP images allowed'}), 400
        clinic_id = g.jwt_claims['clinic_id']
        clinic = db.session.get(Clinic, clinic_id)
        if not clinic:
            return jsonify({'error': 'Clinic not found'}), 404
        client = S3StorageClient()
        url = client.upload(file, 'clinic-logos', file.content_type)
        clinic.logo_url = url
        db.session.commit()
        return jsonify({'url': url}), 200
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 400