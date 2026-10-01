import os
os.environ["TFHUB_CACHE_DIR"] = os.environ.get("TFHUB_CACHE_DIR", "/app/tfhub_cache")
import tensorflow_hub as hub
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

print("Caching YAMNet...", flush=True)
hub.load("https://tfhub.dev/google/yamnet/1")

perch_url = os.environ.get(
    "PERCH_URL",
    "https://www.kaggle.com/models/google/bird-vocalization-classifier/frameworks/TensorFlow2/variations/perch_v2_cpu/versions/1"
)
print(f"Caching Perch 2.0 from {perch_url}...", flush=True)
hub.load(perch_url)

ast_id = os.environ.get("AST_MODEL_ID", "MIT/ast-finetuned-audioset-10-10-0.4593")
hf_cache = os.environ.get("HF_HOME", "/app/hf_cache")
print(f"Caching AST from {ast_id} to {hf_cache}...", flush=True)
AutoFeatureExtractor.from_pretrained(ast_id, cache_dir=hf_cache)
AutoModelForAudioClassification.from_pretrained(ast_id, cache_dir=hf_cache)

print("All bioacoustic models successfully cached.")
