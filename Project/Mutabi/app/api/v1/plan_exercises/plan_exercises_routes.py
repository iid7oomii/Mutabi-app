from flask import Blueprint, request, jsonify
from app.services.plan_exercises_service import PlanExercisesService
from app.api.v1.middleware.role_required import role_required

plan_exercises_bp = Blueprint("plan_exercises", __name__, url_prefix="/plan-exercises")


@plan_exercises_bp.route("/", methods=["POST"])
@role_required("Admin", "Doctor")
def create_plan_exercise():
    """
    Create Plan Exercise
    ---
    tags:
      - Plan Exercises
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
            - therapy_plan_id
            - exercise_id
            - target_days
          properties:
            therapy_plan_id:
              type: string
              example: "uuid-here"
            exercise_id:
              type: string
              example: "uuid-here"
            reps:
              type: integer
              example: 10
            duration_minutes:
              type: integer
              example: 15
            target_days:
              type: string
              example: "Sunday"
    responses:
      201:
        description: تم إنشاء التمرين بنجاح
      400:
        description: خطأ في البيانات
    """
    try:
        data = request.get_json()
        result = PlanExercisesService.create(data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@plan_exercises_bp.route("/plan/<therapy_plan_id>", methods=["GET"])
@role_required("Admin", "Doctor")
def get_by_therapy_plan(therapy_plan_id):
    """
    Get Plan Exercises By Therapy Plan
    ---
    tags:
      - Plan Exercises
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: therapy_plan_id
        required: true
        type: string
    responses:
      200:
        description: قائمة تمارين الخطة
      404:
        description: الخطة غير موجودة
    """
    try:
        result = PlanExercisesService.get_by_therapy_plan(therapy_plan_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@plan_exercises_bp.route("/<plan_exercise_id>", methods=["GET"])
@role_required("Admin", "Doctor")
def get_plan_exercise(plan_exercise_id):
    """
    Get Plan Exercise
    ---
    tags:
      - Plan Exercises
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: plan_exercise_id
        required: true
        type: string
    responses:
      200:
        description: بيانات التمرين
      404:
        description: التمرين غير موجود
    """
    try:
        result = PlanExercisesService.get_by_id(plan_exercise_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@plan_exercises_bp.route("/<plan_exercise_id>", methods=["PUT"])
@role_required("Admin", "Doctor")
def update_plan_exercise(plan_exercise_id):
    """
    Update Plan Exercise
    ---
    tags:
      - Plan Exercises
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: plan_exercise_id
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            reps:
              type: integer
              example: 10
            duration_minutes:
              type: integer
              example: 15
            target_days:
              type: string
              example: "Monday"
    responses:
      200:
        description: تم التحديث بنجاح
      404:
        description: التمرين غير موجود
    """
    try:
        data = request.get_json()
        result = PlanExercisesService.update(plan_exercise_id, data)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@plan_exercises_bp.route("/<plan_exercise_id>", methods=["DELETE"])
@role_required("Admin", "Doctor")
def delete_plan_exercise(plan_exercise_id):
    """
    Delete Plan Exercise
    ---
    tags:
      - Plan Exercises
    consumes:
      - application/json
    security:
      - Bearer: []
    parameters:
      - in: path
        name: plan_exercise_id
        required: true
        type: string
    responses:
      200:
        description: تم الحذف بنجاح
      404:
        description: التمرين غير موجود
    """
    try:
        result = PlanExercisesService.delete(plan_exercise_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404