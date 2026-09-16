"""
Bioacoustic Recognition Microservice
-------------------------------------
Runs on port 5002. Accepts an audio file and returns two things:

1. Generic AudioSet event detection (YAMNet's own 521 classes) — unchanged
   from before, still the always-available fallback.
2. Optional species-level prediction from a classifier trained on combined
    YAMNet + Perch + AST embeddings (see train_audio.py / audio_features.py),
   if that classifier has been trained.

The species-level path now goes through audio_features.py's
extract_combined_embedding(), the SAME function used during training. This
was previously a source of bugs: training trimmed silence before extracting
embeddings, inference didn't, so the classifier saw different-shaped input at
prediction time than it was trained on. That mismatch is now structurally
impossible since both paths call the same shared code.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import io
import csv
import os
import json
import joblib
import hashlib
import librosa
import librosa.effects

from audio_features import (
    yamnet_model, YAMNET_SR, PERCH_SR, extract_combined_embedding,
    get_yamnet_model, get_perch_model, get_ast_model
)

app = Flask(__name__)
CORS(app)

PREDICTION_CACHE = {}
MAX_CACHE_SIZE = 500

# Force-load models at boot to eliminate runtime latency/cold-start on first prediction
print("Pre-loading bioacoustic models (YAMNet, Perch, AST)...", flush=True)
get_yamnet_model()
get_perch_model()
get_ast_model()
print("All bioacoustic models pre-loaded into memory.", flush=True)

class_map_path = yamnet_model.class_map_path().numpy().decode('utf-8')
class_names = []
with tf.io.gfile.GFile(class_map_path) as f:
    reader = csv.DictReader(f)
    for row in reader:
        class_names.append(row['display_name'])
print(f"YAMNet loaded. {len(class_names)} classes available.")

TOP_K = 5
CONFIDENCE_FLOOR = 0.05
SPECIES_CONFIDENCE_FLOOR = 0.35

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
    raw_bytes = file.read()

    # Fast in-memory cache check by content SHA-256 (instant 0ms response on repeated or re-tested files)
    audio_hash = hashlib.sha256(raw_bytes).hexdigest()
    if audio_hash in PREDICTION_CACHE:
        return jsonify(PREDICTION_CACHE[audio_hash])

    # Decode ONCE at 32kHz (Perch rate). Downsample to 16kHz via fast slicing [::2]
    # This cuts audio decode overhead in half compared to decoding twice with librosa.
    try:
        waveform_32k, _ = librosa.load(io.BytesIO(raw_bytes), sr=PERCH_SR, mono=True)
    except Exception as e:
        return jsonify({'error': f'Could not decode audio file: {str(e)}'}), 400

    if waveform_32k.size == 0:
        return jsonify({'error': 'Audio file contained no decodable samples'}), 400

    waveform_32k = waveform_32k.astype(np.float32)
    duration_seconds = float(len(waveform_32k) / PERCH_SR)
    waveform_16k = waveform_32k[::2]  # Instant downsampling to 16kHz for YAMNet

    # --- Generic YAMNet event detection (16kHz path, untrimmed) ---
    scores, embeddings, spectrogram = yamnet_model(waveform_16k)
    scores_np = scores.numpy()

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

    # --- Species-level prediction: isolated salient vocalization window with max_chunks=1
    # This avoids multi-chunk CPU bottleneck on AST while maximizing classification SNR ---
    species_prediction = None
    if species_model is not None:
        try:
            trimmed_32k, _ = librosa.effects.trim(waveform_32k, top_db=25)
            active_32k = trimmed_32k if len(trimmed_32k) >= PERCH_SR * 0.5 else waveform_32k

            combined_emb = extract_combined_embedding(None, active_32k, max_chunks=1)
            probs = species_model.predict_proba(combined_emb.reshape(1, -1))[0]

            best_idx = int(np.argmax(probs))
            best_label = species_model.classes_[best_idx]
            best_confidence = float(probs[best_idx])

            if best_confidence >= SPECIES_CONFIDENCE_FLOOR:
                species_prediction = {
                    'label': str(best_label),
                    'confidence': round(best_confidence, 4)
                }
        except Exception as e:
            print(f"Species prediction failed (falling back to generic events only): {e}")

    if species_prediction is not None:
        response['species_prediction'] = species_prediction

    # Save to LRU cache
    if len(PREDICTION_CACHE) >= MAX_CACHE_SIZE:
        PREDICTION_CACHE.pop(next(iter(PREDICTION_CACHE)))
    PREDICTION_CACHE[audio_hash] = response

    return jsonify(response)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model': 'YAMNet + Perch + AST (species classifier)',
        'num_classes': len(class_names),
        'species_classifier_loaded': species_model is not None,
        'species_classes': species_labels
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', '8080')), debug=False)