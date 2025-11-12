import os
import requests
from flask import Flask, render_template, request, Response, stream_with_context, jsonify
from flask_sqlalchemy import SQLAlchemy

# --- Flask App Initialization ---
app = Flask(__name__)

# --- Configuration ---
# General Config
AI_NODE_URL = os.environ.get("AI_NODE_URL", "http://127.0.0.1:8080/stream")
API_KEY = os.environ.get("API_KEY", "default-secret-key")

# Database Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Database Model ---
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(50), nullable=False) # 'user' or 'ai'
    content = db.Column(db.Text, nullable=False)

# --- Database Initialization ---
with app.app_context():
    db.create_all()

# --- Routes ---
@app.route("/")
def index():
    models = ["gemma", "mistral"]
    messages = Message.query.all()
    return render_template("index.html", models=models, messages=messages)

@app.route("/generate-stream", methods=["POST"])
def generate_stream():
    # Extract all form data
    prompt = request.form.get("prompt", "")
    model = request.form.get("model", "gemma")
    temperature = request.form.get("temperature", 0.7)
    max_new_tokens = request.form.get("max_new_tokens", 150)

    if not prompt:
        return Response("Prompt is required.", status=400)

    # --- Save user's message to the database ---
    user_message = Message(sender='user', content=prompt)
    db.session.add(user_message)
    db.session.commit()

    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "prompt": prompt, 
        "model": model,
        "temperature": temperature,
        "max_new_tokens": max_new_tokens
    }

    try:
        response = requests.post(AI_NODE_URL, headers=headers, json=data, stream=True)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        error_message = f"Error connecting to AI Node Engine: {e}"
        print(error_message)
        return Response(error_message, status=500)

    def stream_content():
        for line in response.iter_lines():
            if line:
                yield line + b'\n'
    
    return Response(stream_with_context(stream_content()), mimetype='text/event-stream')

@app.route("/save-message", methods=["POST"])
def save_message():
    data = request.get_json()
    if not data or 'sender' not in data or 'content' not in data:
        return jsonify({"error": "Invalid data"}), 400
    
    message = Message(sender=data['sender'], content=data['content'])
    db.session.add(message)
    db.session.commit()
    return jsonify({"success": True}), 201

@app.route("/clear-chat", methods=["POST"])
def clear_chat():
    try:
        # Delete all messages from the database
        db.session.query(Message).delete()
        db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
