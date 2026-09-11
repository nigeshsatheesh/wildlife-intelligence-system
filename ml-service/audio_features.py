"""
audio_features.py
-----------------
Shared bioacoustic feature extraction module combining YAMNet, Perch 2.0, and AST (Audio Spectrogram Transformer).
Used by both training (train_audio.py) and serving (app_audio.py) microservices.
"""

import os
import sys
import io
import warnings
from typing import Any, List, Optional, Tuple, Union

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['MKL_NUM_THREADS'] = '1'
warnings.filterwarnings('ignore')

import tensorflow as tf  # type: ignore
import tensorflow_hub as hub  # type: ignore
import torch  # type: ignore
torch.set_num_threads(4)
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification  # type: ignore
import librosa  # type: ignore
import librosa.effects  # type: ignore
import numpy as np

# Sample rates and framing constants
YAMNET_SR: int = 16000
PERCH_SR: int = 32000
AST_SR: int = 16000
CHUNK_SECONDS: float = 5.0
CHUNK_SAMPLES_32K: int = int(PERCH_SR * CHUNK_SECONDS)  # 160,000 samples for 5s @ 32kHz
CHUNK_SAMPLES_16K: int = int(YAMNET_SR * CHUNK_SECONDS)  # 80,000 samples for 5s @ 16kHz
MIN_CLIP_SECONDS: float = 0.5

# Lazy-loaded model singletons
_yamnet_model: Any = None
_perch_model: Any = None
_perch_infer: Any = None
_perch_input_key: Optional[str] = None

_ast_extractor: Any = None
_ast_model: Any = None


def _init_yamnet() -> Any:
    global _yamnet_model
    if _yamnet_model is None:
        print("Loading YAMNet model from TensorFlow Hub...", flush=True)
        try:
            _yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')
        except Exception as e:
            sys.exit(f"Error loading YAMNet model: {e}")
    return _yamnet_model


def _init_perch() -> Tuple[Any, Any, str]:
    global _perch_model, _perch_infer, _perch_input_key
    if _perch_model is None or _perch_infer is None or _perch_input_key is None:
        print("Loading Perch 2.0 model from Kaggle Models...", flush=True)
        PERCH_URL = "https://www.kaggle.com/models/google/bird-vocalization-classifier/frameworks/TensorFlow2/variations/perch_v2_cpu/versions/1"
        try:
            _perch_model = hub.load(PERCH_URL)
            _perch_infer = _perch_model.signatures.get(
                "serving_default", next(iter(_perch_model.signatures.values()))
            )
            if hasattr(_perch_infer, 'structured_input_signature'):
                sig_dict = _perch_infer.structured_input_signature[1]
                if isinstance(sig_dict, dict) and len(sig_dict) > 0:
                    _perch_input_key = list(sig_dict.keys())[0]
            if not _perch_input_key:
                _perch_input_key = "inputs"
            print(f"Perch 2.0 loaded successfully. Signature input key: '{_perch_input_key}'", flush=True)
        except Exception as e:
            sys.exit(f"Error loading Perch model: {e}")
    return _perch_model, _perch_infer, _perch_input_key


def _init_ast() -> Tuple[Any, Any]:
    global _ast_extractor, _ast_model
    if _ast_extractor is None or _ast_model is None:
        print("Loading AST (Audio Spectrogram Transformer) from HuggingFace...", flush=True)
        AST_MODEL_ID = 'MIT/ast-finetuned-audioset-10-10-0.4593'
        try:
            _ast_extractor = AutoFeatureExtractor.from_pretrained(AST_MODEL_ID)
            _ast_model = AutoModelForAudioClassification.from_pretrained(AST_MODEL_ID)
            _ast_model.eval()
            print("AST model loaded successfully.", flush=True)
        except Exception as e:
            sys.exit(f"Error loading AST model: {e}")
    return _ast_extractor, _ast_model


class LazyYamnetProxy:
    def __call__(self, *args, **kwargs):
        return _init_yamnet()(*args, **kwargs)

    def class_map_path(self):
        return _init_yamnet().class_map_path()


# Exported module-level singleton proxy for YAMNet
yamnet_model = LazyYamnetProxy()


def get_yamnet_model() -> Any:
    return _init_yamnet()


def get_perch_model() -> Tuple[Any, Any, str]:
    return _init_perch()


def get_ast_model() -> Tuple[Any, Any]:
    return _init_ast()


def load_and_trim(fpath: str, sr: int = PERCH_SR, top_db: int = 25, min_seconds: float = MIN_CLIP_SECONDS) -> Optional[np.ndarray]:
    """Loads an audio file at specified sample rate (default 32kHz) and trims silence."""
    try:
        waveform, _ = librosa.load(fpath, sr=sr, mono=True)
        waveform, _ = librosa.effects.trim(waveform, top_db=top_db)
    except Exception as e:
        print(f"  Skipping {os.path.basename(fpath)}: {e}", flush=True)
        return None
    if len(waveform) < sr * min_seconds:
        print(f"  Skipping {os.path.basename(fpath)}: too short after trimming silence", flush=True)
        return None
    return waveform.astype(np.float32)


def load_dual_sr(raw_bytes: bytes, top_db: int = 25) -> Tuple[np.ndarray, np.ndarray]:
    """Decodes raw audio bytes at 32kHz, trims silence, and returns (waveform_16k, waveform_32k)."""
    waveform_32k, _ = librosa.load(io.BytesIO(raw_bytes), sr=PERCH_SR, mono=True)
    if waveform_32k.size > 0:
        trimmed, _ = librosa.effects.trim(waveform_32k, top_db=top_db)
        if trimmed.size > 0:
            waveform_32k = trimmed
    waveform_32k = waveform_32k.astype(np.float32)
    waveform_16k = waveform_32k[::2]
    return waveform_16k, waveform_32k


def chunk_waveform_32k(waveform: np.ndarray, chunk_samples: int = CHUNK_SAMPLES_32K) -> List[np.ndarray]:
    """Splits a 32kHz waveform into non-overlapping 5-second (chunk_samples) windows, zero-padding the last chunk."""
    chunks = []
    total = len(waveform)
    for start in range(0, total, chunk_samples):
        chunk = waveform[start:start + chunk_samples]
        if len(chunk) < chunk_samples:
            chunk = np.pad(chunk, (0, chunk_samples - len(chunk)))
        chunks.append(chunk.astype(np.float32))
    return chunks


def extract_combined_embeddings_batch(chunks_32k_list: List[np.ndarray]) -> List[np.ndarray]:
    """Extracts 3328-dimensional combined feature vectors (1024 YAMNet + 1536 Perch 2.0 + 768 AST) for a list of 5s/32kHz chunks."""
    if not chunks_32k_list:
        return []
    yamnet = _init_yamnet()
    _, perch_infer_fn, perch_input_key = _init_perch()
    ast_extractor, ast_model = _init_ast()

    # 1. Perch 2.0 embeddings (32kHz)
    batch_32k = np.array(chunks_32k_list, dtype=np.float32)  # (N, 160000)
    perch_batch = tf.constant(batch_32k, dtype=tf.float32)
    perch_out = perch_infer_fn(**{str(perch_input_key): perch_batch})
    perch_embs = perch_out['embedding'].numpy()  # (N, 1536)

    # 2. YAMNet & 3. AST embeddings (16kHz downsampled)
    batch_16k = batch_32k[:, ::2]  # (N, 80000)
    
    # YAMNet per-chunk mean pooling
    yamnet_embs = []
    for chunk_16k in batch_16k:
        _, yamnet_frames, _ = yamnet(chunk_16k)
        yamnet_embs.append(yamnet_frames.numpy().mean(axis=0))
    yamnet_embs = np.array(yamnet_embs)  # (N, 1024)

    # AST batched PyTorch inference (vectorized across all N chunks)
    ast_inputs = ast_extractor(list(batch_16k), sampling_rate=YAMNET_SR, return_tensors='pt', padding=True)
    with torch.no_grad():
        ast_outputs = ast_model(**ast_inputs, output_hidden_states=True)
        ast_embs = ast_outputs.hidden_states[-1].mean(dim=1).cpu().numpy()  # (N, 768)

    return [np.concatenate([y, p, a]) for y, p, a in zip(yamnet_embs, perch_embs, ast_embs)]



def extract_combined_embedding(arg1: Union[np.ndarray, List[np.ndarray]], arg2: Optional[np.ndarray] = None) -> np.ndarray:
    """Flexible combined embedding extraction:
    - Single 5s chunk or list of chunks -> returns 3328-dim feature vector.
    """
    if arg2 is not None:
        waveform_32k = arg2
        chunks = chunk_waveform_32k(waveform_32k)
        embs = extract_combined_embeddings_batch(chunks)
        return np.mean(embs, axis=0) if embs else np.zeros(3328, dtype=np.float32)
    else:
        if isinstance(arg1, list):
            embs = extract_combined_embeddings_batch(arg1)
            return np.mean(embs, axis=0) if embs else np.zeros(3328, dtype=np.float32)
        chunk = arg1
        if len(chunk) < CHUNK_SAMPLES_32K:
            chunk = np.pad(chunk, (0, CHUNK_SAMPLES_32K - len(chunk)))
        return extract_combined_embeddings_batch([chunk])[0]
