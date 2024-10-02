from flask import Flask, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Serve model.json, metadata.json, weights.bin, and any other model-related files
@app.route('/my_model/<path:filename>')
def serve_model(filename):
    return send_from_directory('static/models', filename)

if __name__ == "__main__":
    app.run(port=8000, debug=True)
