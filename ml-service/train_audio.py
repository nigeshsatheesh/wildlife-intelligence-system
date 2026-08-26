"""
Trains a small species classifier on top of frozen YAMNet embeddings.
YAMNet itself is not fine-tuned — only a lightweight head is trained.

Data augmentation: with very few real clips per species (as few as 10),
the classifier sees almost no variation in recording conditions. Each
clip is expanded into several augmented copies (pitch shift, time
stretch, mild noise) before embedding extraction — a standard technique
for low-data audio classification, not a substitute for more real data,
but a genuine way to squeeze more signal out of what's available.
"""
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import librosa
import os
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
import joblib

DATA_DIR = '../data/audio-train'
TARGET_SR = 16000

print("Loading YAMNet...")
yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')


def augment_variants(waveform, sr):
    """Returns [original, pitch_up, pitch_down, noisy] versions of a waveform."""
    variants = [waveform]

    try:
        pitch_up = librosa.effects.pitch_shift(waveform, sr=sr, n_steps=2)
        variants.append(pitch_up)
    except Exception as e:
        print(f"    pitch_up augmentation failed: {e}")

    try:
        pitch_down = librosa.effects.pitch_shift(waveform, sr=sr, n_steps=-2)
        variants.append(pitch_down)
    except Exception as e:
        print(f"    pitch_down augmentation failed: {e}")

    try:
        noise = np.random.normal(0, 0.005, waveform.shape).astype(np.float32)
        noisy = waveform + noise
        variants.append(noisy)
    except Exception as e:
        print(f"    noise augmentation failed: {e}")

    return variants


X = []
y = []

species_folders = [d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))]
print(f"Found species folders: {species_folders}")

for species in species_folders:
    species_path = os.path.join(DATA_DIR, species)
    files = [f for f in os.listdir(species_path) if f.lower().endswith(('.wav', '.mp3', '.ogg', '.flac', '.m4a'))]
    print(f"{species}: {len(files)} clips")

    for fname in files:
        fpath = os.path.join(species_path, fname)
        try:
            waveform, sr = librosa.load(fpath, sr=TARGET_SR, mono=True)
            # Trim leading/trailing silence — keeps only the part of the
            # clip that actually contains sound above a volume threshold.
            waveform, _ = librosa.effects.trim(waveform, top_db=25)
        except Exception as e:
            print(f"  Skipping {fname}: {e}")
            continue

        if len(waveform) < TARGET_SR * 0.5:  # skip clips under 0.5s after trimming
            print(f"  Skipping {fname}: too short after trimming silence")
            continue

        waveform = waveform.astype(np.float32)

        for variant in augment_variants(waveform, TARGET_SR):
            scores, embeddings, spectrogram = yamnet_model(variant)
            frame_embeddings = embeddings.numpy()

            for emb in frame_embeddings:
                X.append(emb)
                y.append(species)

X = np.array(X)
y = np.array(y)
print(f"\nTotal training examples (frames, including augmented copies): {len(X)}")
print(f"Class distribution: { {label: int((y == label).sum()) for label in set(y)} }")

if len(X) < 10:
    raise ValueError("Not enough data to train. Add more audio clips per species.")

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Random Forest handles the nonlinear structure in embedding space better
# than plain Logistic Regression, without the overfitting risk of a deep
# network on this little data.
clf = RandomForestClassifier(n_estimators=200, max_depth=12, class_weight='balanced', random_state=42)
clf.fit(X_train, y_train)

val_accuracy = clf.score(X_val, y_val)
print(f"\nValidation accuracy: {val_accuracy:.2%}")
print("\nPer-species performance:")
print(classification_report(y_val, clf.predict(X_val)))
print("(Note: with augmented data from a small real clip count, treat this number as directional, not a robust estimate — "
      "augmented copies of the same clip can end up split across train/val, inflating the score slightly.)")

joblib.dump(clf, 'model/species_audio_classifier.pkl')
with open('model/audio_species_labels.json', 'w') as f:
    json.dump(sorted(set(y.tolist())), f)

print("\nSaved model/species_audio_classifier.pkl and model/audio_species_labels.json")