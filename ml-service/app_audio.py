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
(RandomForest on pooled Perch 2.0 embeddings) is layered on top to name a
SPECIFIC species (tiger, lion, ...) rather than just a generic category.
Perch 2.0 replaced YAMNet as the species-classifier's embedding source
because it's trained specifically for species vocalization classification
(Xeno-Canto, iNaturalist, Animal Sound Archive, FSD50k), rather than
YAMNet's general-purpose everyday-sound classes — empirically it raised
clip-level validation accuracy from 56.25% (YAMNet) to 76.25% (Perch) on
our 8-species set. Loaded directly via tensorflow_hub, NOT the
perch-hoplite package (which pulls in s2geometry, a dependency with no
usable Windows wheel).

This whole species-classifier path is optional — the service works fine
with just YAMNet's generic detection if model files aren't present.
"""

import os
import sys
import csv
import io
import json
import warnings
from typing import Any, Optional, List

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
warnings.filterwarnings('ignore')

from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    import tensorflow as tf  # type: ignore
except ImportError as e:
    sys.exit(f"Import Error: TensorFlow missing ({e}). Activate virtual environment.")

try:
    import tensorflow_hub as hub  # type: ignore
except ImportError as e:
    sys.exit(f"Import Error: tensorflow_hub missing ({e}). Activate virtual environment.")

try:
    import librosa  # type: ignore
    import librosa.effects  # type: ignore
except ImportError as e:
    sys.exit(f"Import Error: librosa missing ({e}). Activate virtual environment.")

import numpy as np
import joblib  # type: ignore

app = Flask(__name__)
CORS(app)

print("Loading YAMNet model from TensorFlow Hub...")
try:
    yamnet_model: Any = hub.load('https://tfhub.dev/google/yamnet/1')
except Exception as e:
    sys.exit(f"Error loading YAMNet model: {e}")

class_map_path = yamnet_model.class_map_path().numpy().decode('utf-8')
class_names: List[str] = []
with tf.io.gfile.GFile(class_map_path) as f:
    reader = csv.DictReader(f)
    for row in reader:
        class_names.append(row['display_name'])
print(f"YAMNet loaded. {len(class_names)} classes available.")

TARGET_SR = 16000
TOP_K = 5
CONFIDENCE_FLOOR = 0.05

# --- Perch 2.0 (species classifier's embedding source) ---
PERCH_URL = "https://www.kaggle.com/models/google/bird-vocalization-classifier/frameworks/TensorFlow2/variations/perch_v2_cpu/versions/1"
PERCH_SR = 32000
CHUNK_SECONDS = 5.0
CHUNK_SAMPLES = int(PERCH_SR * CHUNK_SECONDS)  # 160000

# --- Optional species-level classifier (trained via train_audio.py) ---
SPECIES_MODEL_PATH = 'model/species_audio_classifier.pkl'
SPECIES_LABELS_PATH = 'model/audio_species_labels.json'
species_model: Any = None
species_labels: List[str] = []
perch_infer: Any = None
PERCH_INPUT_KEY: Optional[str] = None

if os.path.exists(SPECIES_MODEL_PATH) and os.path.exists(SPECIES_LABELS_PATH):
    try:
        species_model = joblib.load(SPECIES_MODEL_PATH)
        with open(SPECIES_LABELS_PATH, encoding='utf-8') as f:
            species_labels = json.load(f)
        print(f"Species-level audio classifier loaded. Classes: {species_labels}")

        print("Loading Perch 2.0 model for species-classifier embeddings "
              "(downloads from Kaggle on first run, may take a minute)...")
        perch_model: Any = hub.load(PERCH_URL)
        perch_infer = perch_model.signatures.get(
            "serving_default", next(iter(perch_model.signatures.values()))
        )
        if perch_infer is not None and hasattr(perch_infer, 'structured_input_signature'):
            sig_dict = perch_infer.structured_input_signature[1]
            if isinstance(sig_dict, dict) and len(sig_dict) > 0:
                PERCH_INPUT_KEY = list(sig_dict.keys())[0]
        print(f"Perch loaded. Input key: '{PERCH_INPUT_KEY}'")
    except Exception as e:
        print(f"Found species classifier files but failed to load them or Perch ({e}). "
              f"Continuing with generic YAMNet detection only.")
        species_model = None
        perch_infer = None
        PERCH_INPUT_KEY = None
else:
    print("No trained species-level audio classifier found (run train_audio.py to add one). "
          "Continuing with generic YAMNet detection only.")


def chunk_waveform(waveform: np.ndarray, chunk_samples: int = CHUNK_SAMPLES) -> List[np.ndarray]:
    """Splits into non-overlapping chunk_samples-length chunks, zero-padding
    the final (and only, if the clip is short) chunk so every chunk is a
    consistent length for Perch. Must match train_audio.py exactly, or
    predictions will be run against a differently-shaped input than the
    classifier was trained on."""
    chunks = []
    total = len(waveform)
    for start in range(0, total, chunk_samples):
        chunk = waveform[start:start + chunk_samples]
        if len(chunk) < chunk_samples:
            chunk = np.pad(chunk, (0, chunk_samples - len(chunk)))
        chunks.append(chunk.astype(np.float32))
    return chunks


def embed_chunk(chunk: np.ndarray) -> np.ndarray:
    """Runs one 5s/32kHz chunk through Perch + YAMNet, returning the 2560-dim
    concatenated embedding vector (1024 YAMNet + 1536 Perch). Must match train_audio.py's
    combined_embedding exactly."""
    if perch_infer is None or PERCH_INPUT_KEY is None:
        raise RuntimeError("Perch model is not loaded.")
    # Perch embedding (native 32kHz)
    perch_batch = tf.constant(chunk[np.newaxis, :], dtype=tf.float32)
    perch_out = perch_infer(**{str(PERCH_INPUT_KEY): perch_batch})
    perch_emb = perch_out['embedding'].numpy()[0]  # (1536,)

    # YAMNet embedding: resample the SAME chunk to 16kHz, mean-pool frames
    chunk_16k = librosa.resample(chunk, orig_sr=PERCH_SR, target_sr=TARGET_SR)
    _, yamnet_frames, _ = yamnet_model(chunk_16k)
    yamnet_emb = yamnet_frames.numpy().mean(axis=0)  # (1024,)

    return np.concatenate([yamnet_emb, perch_emb])  # (2560,)



@app.route('/predict-audio', methods=['POST'])
def predict_audio():
    """Endpoint for bioacoustic recognition from uploaded audio file."""
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']
    audio_bytes = file.read()  # read once, reused for both YAMNet (16kHz) and Perch (32kHz) decoding

    try:
        waveform, _ = librosa.load(io.BytesIO(audio_bytes), sr=TARGET_SR, mono=True)
    except Exception as e:
        return jsonify({'error': f'Could not decode audio file: {str(e)}'}), 400

    if waveform.size == 0:
        return jsonify({'error': 'Audio file contained no decodable samples'}), 400

    duration_seconds = float(len(waveform) / TARGET_SR)

    waveform = waveform.astype(np.float32)
    scores, _, _ = yamnet_model(waveform)
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

    # Species-level prediction via Perch embeddings (only for species train_audio.py was actually trained on)
    species_prediction = None
    if species_model is not None and perch_infer is not None:
        try:
            perch_waveform, _ = librosa.load(io.BytesIO(audio_bytes), sr=PERCH_SR, mono=True)
        except Exception as e:
            print(f"Could not decode audio at {PERCH_SR}Hz for species classification: {e}")
            perch_waveform = None

        if perch_waveform is not None and perch_waveform.size > 0:
            trimmed, _ = librosa.effects.trim(perch_waveform, top_db=25)
            if trimmed.size == 0:
                trimmed = perch_waveform  # entire clip was below the silence threshold — fall back to untrimmed rather than embedding nothing
            chunks = chunk_waveform(trimmed.astype(np.float32))
            chunk_probs = np.array([species_model.predict_proba([embed_chunk(c)])[0] for c in chunks])
            avg_probs = chunk_probs.mean(axis=0)

            best_idx = int(np.argmax(avg_probs))
            best_label = species_model.classes_[best_idx]
            best_confidence = float(avg_probs[best_idx])

            species_confidence_floor = 0.35
            if best_confidence >= species_confidence_floor:
                species_prediction = {
                    'label': str(best_label),
                    'confidence': round(best_confidence, 4)
                }

    if species_prediction is not None:
        response['species_prediction'] = species_prediction

    return jsonify(response)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'model': 'YAMNet + Perch 2.0 (species classifier)',
        'num_classes': len(class_names),
        'species_classifier_loaded': species_model is not None,
        'species_classes': species_labels
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)