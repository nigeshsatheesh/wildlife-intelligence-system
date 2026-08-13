"""
Trains a small species classifier on top of frozen YAMNet embeddings.
YAMNet itself is not fine-tuned — only a lightweight head is trained,
same transfer-learning principle as train.py for images.

CLIP-LEVEL SPLIT (not frame-level):
YAMNet scores ~0.96s frames, so one 5-second clip yields several frame
embeddings. Splitting those frames randomly into train/val lets frames
from the SAME clip land on both sides — the validation score then partly
reflects "do you recognize this exact recording" rather than genuine
generalization to a new one. This version splits whole CLIPS first, then
extracts frame embeddings only after the split, so no clip's audio ever
appears in both sets.
"""
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import librosa
import os
import json
import random
from sklearn.linear_model import LogisticRegression
import joblib

DATA_DIR = '../data/audio-train'
TARGET_SR = 16000
VAL_FRACTION = 0.25
MIN_CLIPS_PER_SPECIES = 5
RANDOM_SEED = 42

random.seed(RANDOM_SEED)

print("Loading YAMNet...")
yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')

species_folders = sorted([d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))])
print(f"Found species folders: {species_folders}")

def embed_file(fpath):
    """Return this clip's frame-level embeddings (num_frames, 1024), or None if unreadable."""
    try:
        waveform, sr = librosa.load(fpath, sr=TARGET_SR, mono=True)
    except Exception as e:
        print(f"  Skipping {os.path.basename(fpath)}: {e}")
        return None
    if waveform.size == 0:
        return None
    waveform = waveform.astype(np.float32)
    scores, embeddings, spectrogram = yamnet_model(waveform)
    return embeddings.numpy()

X_train, y_train = [], []
X_val, y_val = [], []
clip_manifest = {"train": {}, "val": {}}
usable_species = []

for species in species_folders:
    species_path = os.path.join(DATA_DIR, species)
    files = [f for f in os.listdir(species_path) if f.lower().endswith(('.wav', '.mp3', '.ogg', '.flac', '.m4a'))]
    if len(files) < MIN_CLIPS_PER_SPECIES:
        print(f"Skipping '{species}': only {len(files)} clips (need >= {MIN_CLIPS_PER_SPECIES}).")
        continue
    usable_species.append(species)

    files = files[:]
    random.shuffle(files)
    n_val = max(1, int(len(files) * VAL_FRACTION))
    val_files = files[:n_val]
    train_files = files[n_val:]

    clip_manifest["train"][species] = train_files
    clip_manifest["val"][species] = val_files

    print(f"{species}: {len(train_files)} train clips, {len(val_files)} val clips")

    for fname in train_files:
        frame_embeddings = embed_file(os.path.join(species_path, fname))
        if frame_embeddings is not None:
            for emb in frame_embeddings:
                X_train.append(emb)
                y_train.append(species)

    for fname in val_files:
        frame_embeddings = embed_file(os.path.join(species_path, fname))
        if frame_embeddings is not None:
            for emb in frame_embeddings:
                X_val.append(emb)
                y_val.append(species)

if len(usable_species) < 2:
    raise ValueError(f"Need at least 2 species with >= {MIN_CLIPS_PER_SPECIES} clips each. "
                      f"Found: {usable_species}")

X_train, y_train = np.array(X_train), np.array(y_train)
X_val, y_val = np.array(X_val), np.array(y_val)

print(f"\nTrain frame-embeddings: {len(X_train)}  |  Val frame-embeddings: {len(X_val)}")
print(f"Train class distribution: { {label: int((y_train == label).sum()) for label in set(y_train.tolist())} }")

if len(X_train) < 10 or len(X_val) < 2:
    raise ValueError("Not enough data to train. Add more audio clips per species.")

clf = LogisticRegression(max_iter=1000, class_weight='balanced')
clf.fit(X_train, y_train)

val_accuracy = clf.score(X_val, y_val)
print(f"\nValidation accuracy (clip-level split, no leakage): {val_accuracy:.2%}")
print("This number now reflects genuine generalization to UNSEEN recordings, not just")
print("unseen frames of clips the model already saw elsewhere in training.")
print("Still treat it as a small-data prototype result, not a production benchmark.")

os.makedirs('model', exist_ok=True)
joblib.dump(clf, 'model/species_audio_classifier.pkl')
with open('model/audio_species_labels.json', 'w') as f:
    json.dump(sorted(usable_species), f)
with open('model/audio_clip_manifest.json', 'w') as f:
    json.dump(clip_manifest, f, indent=2)

print("\nSaved model/species_audio_classifier.pkl, model/audio_species_labels.json,")
print("and model/audio_clip_manifest.json (records exactly which clips were train vs val).")