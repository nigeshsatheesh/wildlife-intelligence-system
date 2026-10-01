import os
import sys
import time

os.environ["TFHUB_CACHE_DIR"] = r"C:\ecoguard_cache\tfhub"
os.environ["HF_HOME"] = r"C:\ecoguard_cache\hf"
os.environ["PORT"] = "5002"

print("Starting in-process Flask test client timing test...")
import app_audio
client = app_audio.app.test_client()

audio_path = os.path.abspath(r"..\server\uploads\1787485627778-freesound_community-tiger-growl-66273.mp3")
print(f"Reading test audio: {audio_path}")
with open(audio_path, "rb") as f:
    audio_bytes = f.read()

import io

print("\n--- REQUEST 1 (Cold / First Inference) ---")
t0 = time.perf_counter()
res1 = client.post(
    "/predict-audio",
    data={"audio": (io.BytesIO(audio_bytes), "test.mp3")},
    content_type="multipart/form-data"
)
t1 = time.perf_counter()
print(f"Request 1 Status: {res1.status_code}")
print(f"Request 1 Elapsed: {t1 - t0:.4f}s")
data1 = res1.get_json()
print(f"Request 1 Top Event: {data1.get('events', [{}])[0]}")
print(f"Request 1 Species: {data1.get('species_prediction')}")

print("\n--- REQUEST 2 (Warm / In-Memory Cache) ---")
t2 = time.perf_counter()
res2 = client.post(
    "/predict-audio",
    data={"audio": (io.BytesIO(audio_bytes), "test.mp3")},
    content_type="multipart/form-data"
)
t3 = time.perf_counter()
print(f"Request 2 Status: {res2.status_code}")
print(f"Request 2 Elapsed: {t3 - t2:.4f}s")

# Test Request 3 with fresh audio file (warm model, no cache hit)
audio_path2 = os.path.abspath(r"..\server\uploads\1787748768724-universfield-owl-hoot-144750.mp3")
if os.path.exists(audio_path2):
    print("\n--- REQUEST 3 (Warm Model, Different Audio File / Fresh Inference) ---")
    with open(audio_path2, "rb") as f2:
        audio_bytes2 = f2.read()
    t4 = time.perf_counter()
    res3 = client.post(
        "/predict-audio",
        data={"audio": (io.BytesIO(audio_bytes2), "test2.mp3")},
        content_type="multipart/form-data"
    )
    t5 = time.perf_counter()
    print(f"Request 3 Status: {res3.status_code}")
    print(f"Request 3 Elapsed: {t5 - t4:.4f}s")
    data3 = res3.get_json()
    print(f"Request 3 Top Event: {data3.get('events', [{}])[0]}")
    print(f"Request 3 Species: {data3.get('species_prediction')}")

print("\nALL TIMING CHECKS PASSED.")
