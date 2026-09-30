import unittest
import json
import os
import sys

# Ensure current directory is in PYTHONPATH
sys.path.append(os.path.dirname(__file__))

try:
    from app import app as image_app
except Exception as e:
    image_app = None

try:
    from app_audio import app as audio_app
except Exception as e:
    audio_app = None

class TestMLServices(unittest.TestCase):
    def setUp(self):
        self.image_client = image_app.test_client() if image_app else None
        self.audio_client = audio_app.test_client() if audio_app else None

    def test_image_health(self):
        if not self.image_client:
            self.skipTest("Image app dependencies unavailable")
        response = self.image_client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get('status'), 'ok')

    def test_audio_health(self):
        if not self.audio_client:
            self.skipTest("Audio app dependencies unavailable")
        response = self.audio_client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get('status'), 'ok')

    def test_image_predict_no_file(self):
        if not self.image_client:
            self.skipTest("Image app dependencies unavailable")
        response = self.image_client.post('/predict')
        self.assertEqual(response.status_code, 400)

    def test_audio_predict_no_file(self):
        if not self.audio_client:
            self.skipTest("Audio app dependencies unavailable")
        response = self.audio_client.post('/predict')
        self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main()
