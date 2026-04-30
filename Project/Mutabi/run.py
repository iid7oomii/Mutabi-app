from app import create_app
from flask import Flask, jsonify
from flasgger import Swagger

app = create_app()

swagger = Swagger(app)

@app.route('/api/test')
def test():
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
