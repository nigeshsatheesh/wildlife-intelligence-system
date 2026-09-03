"""
Audits and cleans raw audio clips before training.
Run this BEFORE train_audio.py.
"""
import os
import librosa
import soundfile as sf
import numpy as np

RAW_DIR = '../data/audio-train'
CLEAN_DIR = '../data/audio-train-clean'
TARGET_SR = 16000
MIN_SECONDS = 0.5
MAX_SECONDS = 30.0

os.makedirs(CLEAN_DIR, exist_ok=True)

report = {}

for species in sorted(os.listdir(RAW_DIR)):
    species_path = os.path.join(RAW_DIR, species)
    if not os.path.isdir(species_path):
        continue

    clean_species_path = os.path.join(CLEAN_DIR, species)
    os.makedirs(clean_species_path, exist_ok=True)

    kept, skipped, durations = 0, 0, []

    for fname in os.listdir(species_path):
        if not fname.lower().endswith(('.wav', '.mp3', '.ogg', '.flac', '.m4a')):
            continue
        fpath = os.path.join(species_path, fname)

        try:
            waveform, sr = librosa.load(fpath, sr=TARGET_SR, mono=True)
            waveform, _ = librosa.effects.trim(waveform, top_db=25)
        except Exception as e:
            print(f"  [CORRUPT] {species}/{fname}: {e}")
            skipped += 1
            continue

        duration = len(waveform) / TARGET_SR

        if duration < MIN_SECONDS:
            print(f"  [TOO SHORT] {species}/{fname}: {duration:.2f}s")
            skipped += 1
            continue
        if duration > MAX_SECONDS:
            print(f"  [TOO LONG, trimming to {MAX_SECONDS}s] {species}/{fname}: {duration:.2f}s")
            waveform = waveform[:int(MAX_SECONDS * TARGET_SR)]
            duration = MAX_SECONDS

        out_path = os.path.join(clean_species_path, os.path.splitext(fname)[0] + '.wav')
        sf.write(out_path, waveform, TARGET_SR)
        durations.append(duration)
        kept += 1

    report[species] = {
        'kept': kept,
        'skipped': skipped,
        'avg_duration': round(float(np.mean(durations)), 2) if durations else 0,
        'min_duration': round(float(np.min(durations)), 2) if durations else 0,
        'max_duration': round(float(np.max(durations)), 2) if durations else 0,
    }

print("\n=== Preprocessing report ===")
for species, stats in report.items():
    print(f"{species:12s} kept={stats['kept']:3d}  skipped={stats['skipped']:3d}  "
          f"avg={stats['avg_duration']}s  min={stats['min_duration']}s  max={stats['max_duration']}s")

print(f"\nCleaned files written to {CLEAN_DIR}/")
print("Review the report above — any species with kept < 40 needs more raw clips before training.")