"""
Trains a small species classifier on top of frozen YAMNet embeddings.
YAMNet itself is not fine-tuned — only a lightweight head is trained,
same transfer-learning principle as train.py for images.
"""
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import librosa
import os
import json
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib

DATA_DIR = '../data/audio-train'
TARGET_SR = 16000

print("Loading YAMNet...")
yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')

X = []  # embeddings
y = []  # species labels

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
        except Exception as e:
            print(f"  Skipping {fname}: {e}")
            continue

        waveform = waveform.astype(np.float32)
        scores, embeddings, spectrogram = yamnet_model(waveform)
        frame_embeddings = embeddings.numpy()  # shape: (num_frames, 1024)

        for emb in frame_embeddings:
            X.append(emb)
            y.append(species)

X = np.array(X)
y = np.array(y)
print(f"\nTotal training examples (frames): {len(X)}")
print(f"Class distribution: { {label: int((y == label).sum()) for label in set(y)} }")

if len(X) < 10:
    raise ValueError("Not enough data to train. Add more audio clips per species.")

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

clf = LogisticRegression(max_iter=1000, class_weight='balanced')
clf.fit(X_train, y_train)

val_accuracy = clf.score(X_val, y_val)
print(f"\nValidation accuracy: {val_accuracy:.2%}")
print("(Note: with this little data, treat this number as directional, not a robust estimate)")

joblib.dump(clf, 'model/species_audio_classifier.pkl')
with open('model/audio_species_labels.json', 'w') as f:
    json.dump(sorted(set(y.tolist())), f)

print("\nSaved model/species_audio_classifier.pkl and model/audio_species_labels.json")