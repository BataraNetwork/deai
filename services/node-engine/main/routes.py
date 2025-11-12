from flask import request, jsonify
from . import main
from ..models.gemma import GemmaModel

# Load the Gemma model
gemma_model = GemmaModel()
gemma_model.load()

@main.route('/')
def index():
    return '<h1>Hello, World!</h1>'

@main.route('/gemma', methods=['POST'])
def gemma():
    """
    Handles POST requests to the /gemma endpoint.
    Expects a JSON payload with a "prompt" key.
    Returns the generated text from the Gemma model.
    """
    if not request.json or 'prompt' not in request.json:
        return jsonify({'error': 'Missing "prompt" in request body'}), 400

    prompt = request.json['prompt']
    
    try:
        generated_text = gemma_model.generate(prompt)
        return jsonify({'generated_text': generated_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
