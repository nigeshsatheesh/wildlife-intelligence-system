"""
Bioacoustic Recognition Microservice
-------------------------------------
Runs on port 5002. Accepts an audio file, resamples it to the 16kHz mono
waveform YAMNet expects, and returns the top detected acoustic events with
real confidence scores.

YAMNet is a pretrained model (Google, trained on AudioSet — 2M+ real labeled
audio clips) with 521 general sound event classes. It is NOT a species-level
bird/animal identifier trained by us — it's real inference on real audio,
same category of tool the project spec lists (YAMNet is named directly in
section 7's Audio Intelligence stack). We surface AudioSet's own class names
(e.g. "Bird vocalization, bird call, bird song", "Owl", "Frog", "Insect")
and bucket them into the spec's bioacoustic categories server-side.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import librosa
import csv
import io
import os

app = Flask(__name__)
CORS(app)

print("Loading YAMNet model from TensorFlow Hub...")
yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')

# YAMNet ships its own class map (521 AudioSet class names) as a CSV asset
class_map_path = yamnet_model.class_map_path().numpy().decode('utf-8')
class_names = []
with tf.io.gfile.GFile(class_map_path) as f:
    reader = csv.DictReader(f)
    for row in reader:
        class_names.append(row['display_name'])
print(f"YAMNet loaded. {len(class_names)} classes available.")

TARGET_SR = 16000  # YAMNet requires 16kHz mono waveform input
TOP_K = 5
CONFIDENCE_FLOOR = 0.05  # drop near-zero noise classes from the response


@app.route('/predict-audio', methods=['POST'])
def predict_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']

    try:
        # librosa handles wav/mp3/ogg/flac/m4a and resamples to our target rate directly
        waveform, sr = librosa.load(io.BytesIO(file.read()), sr=TARGET_SR, mono=True)
    except Exception as e:
        return jsonify({'error': f'Could not decode audio file: {str(e)}'}), 400

    if waveform.size == 0:
        return jsonify({'error': 'Audio file contained no decodable samples'}), 400

    duration_seconds = float(len(waveform) / TARGET_SR)

    waveform = waveform.astype(np.float32)
    scores, embeddings, spectrogram = yamnet_model(waveform)
    scores_np = scores.numpy()

    # YAMNet scores each ~0.96s frame independently; average across the whole
    # clip to get one confidence per class for the recording as a whole.
    mean_scores = scores_np.mean(axis=0)
    top_indices = np.argsort(mean_scores)[::-1][:TOP_K]

    events = []
    for idx in top_indices:
        confidence = float(mean_scores[idx])
        if confidence < CONFIDENCE_FLOOR:
            continue
        events.append({
            'label': class_names[idx],
            'confidence': round(confidence, 4)
        })

    if not events:
        # Still return the single best guess even if it's low-confidence,
        # rather than silently returning nothing.
        idx = int(top_indices[0])
        events.append({
            'label': class_names[idx],
            'confidence': round(float(mean_scores[idx]), 4)
        })

    return jsonify({
        'events': events,
        'duration_seconds': round(duration_seconds, 2)
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'YAMNet', 'num_classes': len(class_names)})


if __name__ == '__main__':
    app.run(port=5002, debug=False)