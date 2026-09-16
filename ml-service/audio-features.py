"""
Shared audio embedding extraction — used by BOTH train_audio.py and app_audio.py.

This exists specifically so training and inference can never silently diverge
in preprocessing again (that was the root cause of one of the earlier bugs:
silence was trimmed during training but not at inference time). If you change
anything about how audio is turned into a feature vector, change it here once.

Produces one combined embedding per clip:
  - YAMNet embedding: mean-pooled across all frames -> 1024-d (general audio)
  - Perch embedding: single 5s window -> ~1280-d (bird-specialized; trained
    on Xeno-canto, so it mainly adds signal for eagle/owl, not the mammals)
  - Concatenated together -> one feature vector per clip

Both models are loaded once at import time and reused.
"""
import numpy as np
import librosa
import tensorflow_hub as hub

YAMNET_SR = 16000
PERCH_SR = 32000
PERCH_WINDOW_SECONDS = 5
SILENCE_TOP_DB = 25  # same threshold used everywhere audio is trimmed

print("Loading YAMNet...")
yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')

print("Loading Perch (bird-vocalization-classifier)...")
perch_model = hub.load('https://tfhub.dev/google/bird-vocalization-classifier/1')


def load_and_trim(file_or_buffer, target_sr):
    """Load audio at target_sr, mono, with leading/trailing silence trimmed.
    Used identically by training and inference — do not duplicate this logic
    elsewhere."""
    waveform, sr = librosa.load(file_or_buffer, sr=target_sr, mono=True)
    waveform, _ = librosa.effects.trim(waveform, top_db=SILENCE_TOP_DB)
    return waveform.astype(np.float32)


def get_yamnet_embedding(waveform_16k):
    """Mean-pool YAMNet's per-frame embeddings into a single 1024-d vector."""
    _, embeddings, _ = yamnet_model(waveform_16k)
    return embeddings.numpy().mean(axis=0)


def get_perch_embedding(waveform_32k):
    """Perch expects exactly 5s @ 32kHz. Zero-pad short clips, take the
    loudest 5s window for long clips (peak-energy window, not just the
    first 5s, so we don't cut off a call that happens later in the clip)."""
    target_len = PERCH_WINDOW_SECONDS * PERCH_SR

    if len(waveform_32k) <= target_len:
        padded = np.zeros(target_len, dtype=np.float32)
        padded[:len(waveform_32k)] = waveform_32k
        window = padded
    else:
        # slide a target_len window, pick the one with highest RMS energy
        best_start, best_energy = 0, -1.0
        step = PERCH_SR  # check every 1s
        for start in range(0, len(waveform_32k) - target_len + 1, step):
            energy = np.sqrt(np.mean(waveform_32k[start:start + target_len] ** 2))
            if energy > best_energy:
                best_energy, best_start = energy, start
        window = waveform_32k[best_start:best_start + target_len]

    _, embeddings = perch_model.infer_tf(window[np.newaxis, :])
    return embeddings.numpy()[0]


def extract_combined_embedding(waveform_16k, waveform_32k):
    """The single feature vector every classifier in this project should be
    trained/predicted on: YAMNet embedding concatenated with Perch embedding."""
    yamnet_emb = get_yamnet_embedding(waveform_16k)
    perch_emb = get_perch_embedding(waveform_32k)
    return np.concatenate([yamnet_emb, perch_emb])


def load_dual_sr(file_or_buffer):
    """Load the same audio at both sample rates needed (16k for YAMNet,
    32k for Perch), trimming silence consistently. Accepts a file path or
    a BytesIO buffer; if a buffer, it must be re-seeked between reads."""
    import io
    if isinstance(file_or_buffer, (bytes, bytearray)):
        buf16 = io.BytesIO(file_or_buffer)
        buf32 = io.BytesIO(file_or_buffer)
    else:
        buf16 = buf32 = file_or_buffer  # file path — librosa can reopen it twice

    waveform_16k = load_and_trim(buf16, YAMNET_SR)
    waveform_32k = load_and_trim(buf32, PERCH_SR)
    return waveform_16k, waveform_32k