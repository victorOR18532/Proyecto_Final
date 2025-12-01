from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Simulación de base de datos en memoria
notes = []

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "notes"}), 200

@app.route('/metrics', methods=['GET'])
def metrics():
    # Formato Prometheus en lugar de JSON
    metrics_text = f"""# HELP notes_total Total number of notes
# TYPE notes_total gauge
notes_total {len(notes)}

# HELP notes_service_info Service information
# TYPE notes_service_info gauge
notes_service_info{{service="notes"}} 1
"""
    return Response(metrics_text, mimetype='text/plain')

@app.route('/notes', methods=['GET'])
def get_notes():
    return jsonify(notes), 200

@app.route('/notes', methods=['POST'])
def create_note():
    data = request.json
    note = {
        "id": len(notes) + 1,
        "title": data.get('title'),
        "content": data.get('content')
    }
    notes.append(note)
    return jsonify(note), 201

@app.route('/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    global notes
    notes = [n for n in notes if n['id'] != note_id]
    return jsonify({"message": "Note deleted"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)