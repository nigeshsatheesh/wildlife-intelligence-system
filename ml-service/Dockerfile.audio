FROM python:3.10-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 ffmpeg libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python -m pip install --no-cache-dir --upgrade pip

RUN python -m pip install --no-cache-dir \
    "https://download-r2.pytorch.org/whl/cpu/torch-2.14.0%2Bcpu-cp310-cp310-manylinux_2_28_x86_64.whl" \
    --index-url https://pypi.org/simple

RUN python -m pip install --no-cache-dir -r requirements.txt

RUN python -m pip install --no-cache-dir gunicorn

COPY . .
ENV TFHUB_CACHE_DIR=/app/tfhub_cache
RUN python -c "from audio_features import get_yamnet_model, get_perch_model, get_ast_model; get_yamnet_model(); get_perch_model(); get_ast_model()"

EXPOSE 8080
CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 1 --timeout 300 --access-logfile - --error-logfile - app_audio:app"]