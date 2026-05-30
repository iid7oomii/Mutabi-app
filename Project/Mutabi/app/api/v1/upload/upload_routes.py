from flask import Blueprint, request, jsonify
from app.api.v1.middleware.role_required import role_required
from app.integrations.storage import S3StorageClient

upload_bp = Blueprint('upload', __name__, url_prefix='/upload')

ALLOWED_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm'
}

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