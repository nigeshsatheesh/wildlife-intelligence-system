from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io
import os

app = Flask(__name__)
CORS(app)

print("Loading image classifier model...")
model = tf.keras.models.load_model('model/classifier.h5')

with open('class_labels.json') as f:
    class_indices = json.load(f)
labels = {v: k for k, v in class_indices.items()}  # invert: index -> species name
print("Image model loaded. 12 Classes:", labels)

UNKNOWN_THRESHOLD = float(os.environ.get('UNKNOWN_THRESHOLD', '0.5'))

def assess_image_quality(img):
    gray = np.array(img.convert('L'))
    # Variance of Laplacian for blur detection
    gy, gx = np.gradient(gray)
    blur_var = float(np.var(gx) + np.var(gy))
    brightness = float(np.mean(gray))

    issues = []
    if blur_var < 50:
        issues.append('Image appears blurry')
    if brightness < 40:
        issues.append('Underexposed / low lighting')
    elif brightness > 220:
        issues.append('Overexposed / harsh glare')

    # Normalize quality score 0-100
    blur_score = min(100, blur_var / 5.0)
    bright_score = 100 - abs(brightness - 128) * 0.7
    score = Math_clamp(int(blur_score * 0.6 + bright_score * 0.4))

    rating = 'good' if score >= 75 else ('fair' if score >= 45 else 'poor')
    return {
        'score': score,
        'rating': rating,
        'issues': issues,
        'resolution': f"{img.width}x{img.height}"
    }

def Math_clamp(val):
    return max(0, min(100, val))

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    raw_bytes = file.read()
    img = Image.open(io.BytesIO(raw_bytes)).convert('RGB')
    
    quality = assess_image_quality(img)

    img_resized = img.resize((224, 224))
    arr = np.array(img_resized) / 255.0
    arr = np.expand_dims(arr, axis=0)

    predictions = model.predict(arr)[0]
    top_indices = np.argsort(predictions)[::-1]
    
    predicted_idx = int(top_indices[0])
    top1_conf = float(predictions[predicted_idx])
    top2_conf = float(predictions[top_indices[1]]) if len(top_indices) > 1 else 0.0

    margin = top1_conf - top2_conf
    is_unknown = bool(top1_conf < UNKNOWN_THRESHOLD or margin < 0.15)

    top_k = []
    for idx in top_indices[:3]:
        top_k.append({
            'label': labels[int(idx)],
            'confidence': round(float(predictions[idx]), 4)
        })

    return jsonify({
        'label': labels[predicted_idx],
        'confidence': round(top1_conf, 4),
        'quality': quality,
        'isUnknown': is_unknown,
        'topK': top_k
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'classes': list(labels.values()), 'unknown_threshold': UNKNOWN_THRESHOLD})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', '5001')), debug=False)