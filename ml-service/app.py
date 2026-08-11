from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io

app = Flask(__name__)
CORS(app)

print("Loading model...")
model = tf.keras.models.load_model('model/classifier.h5')

with open('class_labels.json') as f:
    class_indices = json.load(f)
labels = {v: k for k, v in class_indices.items()}  # invert: index -> species name
print("Model loaded. Classes:", labels)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    img = Image.open(io.BytesIO(file.read())).convert('RGB').resize((224, 224))
    arr = np.array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)

    predictions = model.predict(arr)[0]
    predicted_idx = int(np.argmax(predictions))

    return jsonify({
        'label': labels[predicted_idx],
        'confidence': float(predictions[predicted_idx])
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'classes': list(labels.values())})

if __name__ == '__main__':
    app.run(port=5001, debug=False)