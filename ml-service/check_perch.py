import numpy as np
import tensorflow as tf
import tensorflow_hub as hub

url = "https://www.kaggle.com/models/google/bird-vocalization-classifier/frameworks/TensorFlow2/variations/perch_v2_cpu/versions/1"
print("Loading Perch 2.0 (downloads on first run, may take a minute)...")
model = hub.load(url)

f = model.signatures.get("serving_default", next(iter(model.signatures.values())))
input_key = list(f.structured_input_signature[1].keys())[0]
print(f"Input key: {input_key}")

waveform = tf.zeros([1, 160000], tf.float32)  # 5s @ 32kHz, batch of 1
out = f(**{input_key: waveform})

print("\nOutput keys and shapes:")
for k, v in out.items():
    print(f"  {k}: {v.shape}")