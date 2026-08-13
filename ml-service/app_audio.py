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

Optionally, if you've run train_audio.py, a small species-level classifier
(LogisticRegression on pooled YAMNet embeddings) is layered on top to name
a SPECIFIC species (tiger, lion, ...) rather than just a generic category.
This is fully optional — the service works fine without it.
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
import json
import joblib

app = Flask(__name__)
CORS(app)

print("Loading YAMNet model from TensorFlow Hub...")
yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')

class_map_path = yamnet_model.class_map_path().numpy().decode('utf-8')
class_names = []
with tf.io.gfile.GFile(class_map_path) as f:
    reader = csv.DictReader(f)
    for row in reader:
        class_names.append(row['display_name'])
print(f"YAMNet loaded. {len(class_names)} classes available.")

TARGET_SR = 16000
TOP_K = 5
CONFIDENCE_FLOOR = 0.05

# --- Optional species-level classifier (trained via train_audio.py) ---
SPECIES_MODEL_PATH = 'model/species_audio_classifier.pkl'
SPECIES_LABELS_PATH = 'model/audio_species_labels.json'
species_model = None
species_labels = []

if os.path.exists(SPECIES_MODEL_PATH) and os.path.exists(SPECIES_LABELS_PATH):
    try:
        species_model = joblib.load(SPECIES_MODEL_PATH)
        with open(SPECIES_LABELS_PATH) as f:
            species_labels = json.load(f)
        print(f"Species-level audio classifier loaded. Classes: {species_labels}")
    except Exception as e:
        print(f"Found species classifier files but failed to load them ({e}). "
              f"Continuing with generic YAMNet detection only.")
        species_model = None
else:
    print("No trained species-level audio classifier found (run train_audio.py to add one). "
          "Continuing with generic YAMNet detection only.")


@app.route('/predict-audio', methods=['POST'])
def predict_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']

    try:
        waveform, sr = librosa.load(io.BytesIO(file.read()), sr=TARGET_SR, mono=True)
    except Exception as e:
        return jsonify({'error': f'Could not decode audio file: {str(e)}'}), 400

    if waveform.size == 0:
        return jsonify({'error': 'Audio file contained no decodable samples'}), 400

    duration_seconds = float(len(waveform) / TARGET_SR)

    waveform = waveform.astype(np.float32)
    scores, embeddings, spectrogram = yamnet_model(waveform)
    scores_np = scores.numpy()
    embeddings_np = embeddings.numpy()

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
        idx = int(top_indices[0])
        events.append({
            'label': class_names[idx],
            'confidence': round(float(mean_scores[idx]), 4)
        })

    response = {
        'events': events,
        'duration_seconds': round(duration_seconds, 2)
    }

    # Optional species-level prediction. Pool this clip's frame embeddings into
    # ONE vector, same as train_audio.py does per-clip at inference conceptually
    # (train_audio.py trains on frames, so we score each frame and pick the
    # majority-vote / mean-probability class across the clip's frames — more
    # stable than trusting a single frame).
    if species_model is not None and embeddings_np.shape[0] > 0:
        frame_probs = species_model.predict_proba(embeddings_np)  # (num_frames, num_species)
        mean_probs = frame_probs.mean(axis=0)
        top_idx = int(np.argmax(mean_probs))
        response['species_prediction'] = {
            'label': species_model.classes_[top_idx],
            'confidence': round(float(mean_probs[top_idx]), 4)
        }

    return jsonify(response)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model': 'YAMNet',
        'num_classes': len(class_names),
        'species_classifier_loaded': species_model is not None,
        'species_classes': species_labels
    })


if __name__ == '__main__':
    app.run(port=5002, debug=False)