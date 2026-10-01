import os
import sys
import time
import subprocess
import requests

os.environ["TFHUB_CACHE_DIR"] = r"C:\ecoguard_cache\tfhub"
os.environ["HF_HOME"] = r"C:\ecoguard_cache\hf"
os.environ["PORT"] = "5002"

python_exe = sys.executable

audio_path = os.path.abspath(r"..\server\uploads\1787485627778-freesound_community-tiger-growl-66273.mp3")
if not os.path.exists(audio_path):
    # fallback to any mp3
    upload_dir = os.path.abspath(r"..\server\uploads")
    for f in os.listdir(upload_dir):
        if f.endswith(".mp3"):
            audio_path = os.path.join(upload_dir, f)
            break

print(f"Using audio test file: {audio_path}")

print("Starting app_audio.py server...")
proc = subprocess.Popen([python_exe, "app_audio.py"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)

# Wait for server to boot and load models
server_ready = False
for _ in range(60):
    time.sleep(1)
    try:
        r = requests.get("http://127.0.0.1:5002/health", timeout=1)
        if r.status_code == 200:
            server_ready = True
            break
    except Exception:
        # Check if process died
        if proc.poll() is not None:
            stdout, _ = proc.communicate()
            print("Server process exited prematurely:")
            print(stdout)
            sys.exit(1)

if not server_ready:
    # Try sending a probe or wait 10 more seconds
    time.sleep(5)

print("\n--- TIMING TEST ---")
with open(audio_path, "rb") as f:
    audio_data = f.read()

# Request 1
t0 = time.time()
res1 = requests.post("http://127.0.0.1:5002/predict-audio", files={"audio": ("test.mp3", audio_data, "audio/mpeg")})
t1 = time.time()
req1_time = t1 - t0
print(f"Request 1 Status: {res1.status_code}")
print(f"Request 1 Time: {req1_time:.4f}s")
print(f"Request 1 Events: {res1.json().get('events', [])[:3]}")

# Request 2
t2 = time.time()
res2 = requests.post("http://127.0.0.1:5002/predict-audio", files={"audio": ("test.mp3", audio_data, "audio/mpeg")})
t3 = time.time()
req2_time = t3 - t2
print(f"Request 2 Status: {res2.status_code}")
print(f"Request 2 Time: {req2_time:.4f}s")
print(f"Request 2 Events: {res2.json().get('events', [])[:3]}")

# Request 3 with different audio file (to test non-cached inference timing)
audio_path2 = os.path.abspath(r"..\server\uploads\1787748768724-universfield-owl-hoot-144750.mp3")
if os.path.exists(audio_path2):
    with open(audio_path2, "rb") as f2:
        audio_data2 = f2.read()
    t4 = time.time()
    res3 = requests.post("http://127.0.0.1:5002/predict-audio", files={"audio": ("test2.mp3", audio_data2, "audio/mpeg")})
    t5 = time.time()
    req3_time = t5 - t4
    print(f"Request 3 (different file, fresh inference) Time: {req3_time:.4f}s")
    print(f"Request 3 Events: {res3.json().get('events', [])[:3]}")

proc.terminate()
try:
    proc.wait(timeout=5)
except subprocess.TimeoutExpired:
    proc.kill()

print("\nSUCCESS: Timing test completed successfully.")
