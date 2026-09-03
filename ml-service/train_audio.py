"""
Trains a small species classifier on top of CONCATENATED YAMNet + Perch 2.0
embeddings (1024 + 1536 = 2560-dim combined feature vector per chunk).

This is an ensemble of the two prior approaches: Perch alone reached 76.25%
clip-level accuracy (vs. YAMNet alone's 56.25%), with Tiger remaining weak
(0.42 f1) due to genuine acoustic overlap with Bear/Lion roars — a hard
case that reflects real similarity in the sounds themselves, not a gap in
either embedding model individually. Combining both gives the classifier
access to whatever complementary signal each model captures that the other
doesn't; expect a modest incremental improvement, not a dramatic one — the
underlying data-volume limitation (40 train clips/species) is unchanged.

Common chunking unit: Perch's fixed 5-second/32kHz window. For each chunk,
the SAME audio is also resampled to 16kHz and run through YAMNet, with
YAMNet's per-frame embeddings mean-pooled into one 1024-dim vector — this
keeps both embeddings describing the identical audio segment rather than
mismatched windows, which would make concatenation meaningless.

Data augmentation, clip-level train/val split, and dual chunk-level /
clip-level accuracy reporting are unchanged from prior versions.
"""
import os
import sys
import json
import warnings

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
warnings.filterwarnings('ignore')

try:
    import tensorflow as tf
except ImportError as e:
    sys.exit(f"Import Error: TensorFlow is missing ({e}). Activate your venv first.")

try:
    import tensorflow_hub as hub
except ImportError as e:
    sys.exit(f"Import Error: tensorflow_hub is missing ({e}).")

try:
    import librosa
except ImportError as e:
    sys.exit(f"Import Error: librosa is missing ({e}).")

try:
    import numpy as np
    import joblib
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import classification_report, confusion_matrix
    from sklearn.model_selection import train_test_split
except ImportError as e:
    sys.exit(f"Import Error: Required dependency missing ({e}).")

DATA_DIR = '../data/audio-train-clean'
PERCH_URL = "https://www.kaggle.com/models/google/bird-vocalization-classifier/frameworks/TensorFlow2/variations/perch_v2_cpu/versions/1"
PERCH_SR = 32000
YAMNET_SR = 16000
CHUNK_SECONDS = 5.0
CHUNK_SAMPLES_32K = int(PERCH_SR * CHUNK_SECONDS)  # 160000
MIN_CLIP_SECONDS = 0.5

print("Loading YAMNet model from TensorFlow Hub...")
try:
    yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')
except Exception as e:
    sys.exit(f"Error loading YAMNet model: {e}")

print("Loading Perch 2.0 model (downloads from Kaggle on first run, may take a minute)...")
try:
    perch_model = hub.load(PERCH_URL)
    perch_infer = perch_model.signatures.get(
        "serving_default", next(iter(perch_model.signatures.values()))
    )
    PERCH_INPUT_KEY = list(perch_infer.structured_input_signature[1].keys())[0]
    print(f"Perch loaded. Input key: '{PERCH_INPUT_KEY}'")
except Exception as e:
    sys.exit(f"Error loading Perch model: {e}")


def chunk_waveform_32k(waveform, chunk_samples=CHUNK_SAMPLES_32K):
    """Splits a 32kHz waveform into non-overlapping chunk_samples-length
    chunks, zero-padding the final (and only, if the clip is short) chunk."""
    chunks = []
    total = len(waveform)
    for start in range(0, total, chunk_samples):
        chunk = waveform[start:start + chunk_samples]
        if len(chunk) < chunk_samples:
            chunk = np.pad(chunk, (0, chunk_samples - len(chunk)))
        chunks.append(chunk.astype(np.float32))
    return chunks


def combined_embedding(chunk_32k):
    """Given one 5s/32kHz chunk, returns a 2560-dim vector: YAMNet's
    mean-pooled 1024-dim embedding (computed on the SAME audio, resampled
    to 16kHz) concatenated with Perch's 1536-dim embedding."""
    # Perch embedding (native 32kHz)
    perch_batch = tf.constant(chunk_32k[np.newaxis, :], dtype=tf.float32)
    perch_out = perch_infer(**{PERCH_INPUT_KEY: perch_batch})
    perch_emb = perch_out['embedding'].numpy()[0]  # (1536,)

    # YAMNet embedding: resample the SAME chunk to 16kHz, mean-pool frames
    chunk_16k = librosa.resample(chunk_32k, orig_sr=PERCH_SR, target_sr=YAMNET_SR)
    _, yamnet_frames, _ = yamnet_model(chunk_16k)
    yamnet_emb = yamnet_frames.numpy().mean(axis=0)  # (1024,)

    return np.concatenate([yamnet_emb, perch_emb])  # (2560,)


def augment_variants(waveform, sr):
    """Returns [original, pitch_up, pitch_down, noisy] versions of a waveform."""
    variants = [waveform]
    try:
        variants.append(librosa.effects.pitch_shift(waveform, sr=sr, n_steps=2))
    except Exception as e:
        print(f"    pitch_up augmentation failed: {e}")
    try:
        variants.append(librosa.effects.pitch_shift(waveform, sr=sr, n_steps=-2))
    except Exception as e:
        print(f"    pitch_down augmentation failed: {e}")
    try:
        noise = np.random.normal(0, 0.005, waveform.shape).astype(np.float32)
        variants.append(waveform + noise)
    except Exception as e:
        print(f"    noise augmentation failed: {e}")
    return variants


def load_clip(fpath):
    """Loads, resamples to 32kHz, and trims silence. Returns None if unusable."""
    try:
        waveform, sr = librosa.load(fpath, sr=PERCH_SR, mono=True)
        waveform, _ = librosa.effects.trim(waveform, top_db=25)
    except Exception as e:
        print(f"  Skipping {os.path.basename(fpath)}: {e}")
        return None
    if len(waveform) < PERCH_SR * MIN_CLIP_SECONDS:
        print(f"  Skipping {os.path.basename(fpath)}: too short after trimming silence")
        return None
    return waveform.astype(np.float32)


# --- Step 1: discover clips, grouped by species, at the FILE level ---
species_folders = [d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))]
print(f"Found species folders: {species_folders}")

clip_paths, clip_species = [], []
for species in species_folders:
    species_path = os.path.join(DATA_DIR, species)
    files = [f for f in os.listdir(species_path) if f.lower().endswith(('.wav', '.mp3', '.ogg', '.flac', '.m4a'))]
    print(f"{species}: {len(files)} clips found")
    for fname in files:
        clip_paths.append(os.path.join(species_path, fname))
        clip_species.append(species)

if len(clip_paths) < 10:
    raise ValueError("Not enough clips found. Add more audio files per species.")

# --- Step 2: split at the CLIP level, before augmentation or embedding ---
train_paths, val_paths, train_labels, val_labels = train_test_split(
    clip_paths, clip_species, test_size=0.2, random_state=42, stratify=clip_species
)
print(f"\nClip-level split: {len(train_paths)} train clips, {len(val_paths)} val clips")

# --- Step 3: build TRAIN features (augmented) ---
X_train, y_train = [], []
print("\nProcessing TRAIN clips (extracting combined YAMNet+Perch embeddings)...")
for i, (fpath, species) in enumerate(zip(train_paths, train_labels)):
    print(f"  [{i+1}/{len(train_paths)}] {species}: {os.path.basename(fpath)}")
    waveform = load_clip(fpath)
    if waveform is None:
        continue
    for variant in augment_variants(waveform, PERCH_SR):
        for chunk in chunk_waveform_32k(variant):
            X_train.append(combined_embedding(chunk))
            y_train.append(species)

# --- Step 4: build VAL features (NOT augmented), tracking which clip each chunk came from ---
X_val, y_val, val_clip_ids = [], [], []
print("\nProcessing VAL clips (extracting combined YAMNet+Perch embeddings)...")
for i, (fpath, species) in enumerate(zip(val_paths, val_labels)):
    print(f"  [{i+1}/{len(val_paths)}] {species}: {os.path.basename(fpath)}")
    waveform = load_clip(fpath)
    if waveform is None:
        continue
    for chunk in chunk_waveform_32k(waveform):
        X_val.append(combined_embedding(chunk))
        y_val.append(species)
        val_clip_ids.append(i)

X_train, y_train = np.array(X_train), np.array(y_train)
X_val, y_val = np.array(X_val), np.array(y_val)
val_clip_ids = np.array(val_clip_ids)

print(f"\nTraining examples (chunks, incl. augmented copies): {len(X_train)}")
print(f"Validation examples (chunks, real clips only): {len(X_val)}")
print(f"Feature dimensionality: {X_train.shape[1]} (1024 YAMNet + 1536 Perch)")
print(f"Train class distribution: { {l: int((y_train == l).sum()) for l in set(y_train)} }")

clf = RandomForestClassifier(n_estimators=200, max_depth=12, class_weight='balanced', random_state=42)
clf.fit(X_train, y_train)

# --- Chunk-level accuracy (each chunk judged independently) ---
chunk_accuracy = clf.score(X_val, y_val)
print(f"\nChunk-level validation accuracy: {chunk_accuracy:.2%}")
print("\nPer-species performance (chunk-level):")
print(classification_report(y_val, clf.predict(X_val)))

labels_sorted = sorted(set(y_val))
cm = confusion_matrix(y_val, clf.predict(X_val), labels=labels_sorted)
print("Confusion matrix (rows = actual, columns = predicted):")
header = "        " + " ".join(f"{l[:6]:>6}" for l in labels_sorted)
print(header)
for label, row in zip(labels_sorted, cm):
    print(f"{label[:6]:>6}  " + " ".join(f"{v:>6}" for v in row))

# --- Clip-level accuracy — the number that matches real production behavior ---
print("\nComputing clip-level accuracy (matches real app_audio.py prediction behavior)...")
chunk_probs = clf.predict_proba(X_val)
class_order = clf.classes_

clip_true, clip_pred = [], []
for clip_idx in sorted(set(val_clip_ids)):
    mask = val_clip_ids == clip_idx
    avg_probs = chunk_probs[mask].mean(axis=0)
    predicted_label = class_order[np.argmax(avg_probs)]
    true_label = y_val[mask][0]
    clip_true.append(true_label)
    clip_pred.append(predicted_label)

clip_accuracy = np.mean(np.array(clip_true) == np.array(clip_pred))
print(f"\nCLIP-LEVEL validation accuracy: {clip_accuracy:.2%}  <-- this is your real, reportable number")
print("\nPer-species performance (clip-level):")
print(classification_report(clip_true, clip_pred))

os.makedirs('model', exist_ok=True)
joblib.dump(clf, 'model/species_audio_classifier.pkl')
with open('model/audio_species_labels.json', 'w') as f:
    json.dump(sorted(set(y_train.tolist())), f)

print("\nSaved model/species_audio_classifier.pkl and model/audio_species_labels.json")
print("\nNOTE: This model now expects 2560-dim combined embeddings (1024 YAMNet")
print("+ 1536 Perch), not the 1536-dim Perch-only embeddings from before.")
print("app_audio.py must be updated to match before restarting the audio service.")