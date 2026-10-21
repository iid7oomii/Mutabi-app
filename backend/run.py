from app import create_app
from flask import jsonify
from flasgger import Swagger

app = create_app()

swagger_config = {
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "أضف التوكن كذا: Bearer <token>"
        }
    }
}

swagger = Swagger(app, template=swagger_config)

@app.route('/api/test')
def test():
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)