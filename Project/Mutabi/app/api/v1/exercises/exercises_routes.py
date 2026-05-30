from flask import Blueprint, request, jsonify
from app.services.exercises_service import ExercisesService
from app.api.v1.middleware.role_required import role_required

exercises_bp = Blueprint("exercises", __name__, url_prefix="/exercises")


@exercises_bp.route("/", methods=["POST"])
@role_required("Admin", "Doctor")
def create_exercise():
    """
    Create Exercise
    ---
    tags:
      - Exercises
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - title
            - description
          properties:
            title:
              type: string
              example: "Sensory Brushing"
            description:
              type: string
              example: "وصف التمرين"
            doctor_media_url:
              type: string
              example: "https://bucket.amazonaws.com/video.mp4"
    responses:
      201:
        description: تم إنشاء التمرين بنجاح
      400:
        description: خطأ في البيانات
    """
    try:
        data = request.get_json()
        result = ExercisesService.create(data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@exercises_bp.route("/", methods=["GET"])
@role_required("Admin", "Doctor")
def get_exercises():
    """
    Get Exercises
    ---
    tags:
      - Exercises
    consumes:
      - application/json
    security:
      - Bearer: []
    responses:
      200:
        description: قائمة التمارين
    """
    try:
        result = ExercisesService.get_all()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@exercises_bp.route("/<exercise_id>", methods=["GET"])
@role_required("Admin", "Doctor")
def get_exercise(exercise_id):
    """
    Get Exercise
    ---
    tags:
      - Exercises
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: exercise_id
        required: true
        type: string
    responses:
      200:
        description: بيانات التمرين
      404:
        description: التمرين غير موجود
    """
    try:
        result = ExercisesService.get_by_id(exercise_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@exercises_bp.route("/<exercise_id>", methods=["PUT"])
@role_required("Admin", "Doctor")
def update_exercise(exercise_id):
    """
    Update Exercise
    ---
    tags:
      - Exercises
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: exercise_id
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
              example: "Sensory Brushing"
            description:
              type: string
              example: "وصف محدث"
            doctor_media_url:
              type: string
              example: "https://bucket.amazonaws.com/video.mp4"
    responses:
      200:
        description: تم التحديث بنجاح
      404:
        description: التمرين غير موجود
    """
    try:
        data = request.get_json()
        result = ExercisesService.update(exercise_id, data)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@exercises_bp.route("/<exercise_id>", methods=["DELETE"])
@role_required("Admin", "Doctor")
def delete_exercise(exercise_id):
    """
    Delete Exercise
    ---
    tags:
      - Exercises
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: exercise_id
        required: true
        type: string
    responses:
      200:
        description: تم الحذف بنجاح
      404:
        description: التمرين غير موجود
    """
    try:
        result = ExercisesService.delete(exercise_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404