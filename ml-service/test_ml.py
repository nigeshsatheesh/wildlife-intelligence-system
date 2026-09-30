import unittest
import json
import os
import sys

# Ensure current directory is in PYTHONPATH
sys.path.append(os.path.dirname(__file__))

from app import app as image_app
from app_audio import app as audio_app

class TestMLServices(unittest.TestCase):
    def setUp(self):
        self.image_client = image_app.test_client()
        self.audio_client = audio_app.test_client()

    def test_image_health(self):
        response = self.image_client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get('status'), 'ok')

    def test_audio_health(self):
        response = self.audio_client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get('status'), 'ok')

    def test_image_predict_no_file(self):
        response = self.image_client.post('/predict')
        self.assertEqual(response.status_code, 400)

    def test_audio_predict_no_file(self):
        response = self.audio_client.post('/predict')
        self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main()
