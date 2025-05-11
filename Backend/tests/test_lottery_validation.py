import unittest
from unittest.mock import patch, MagicMock
from flask import Flask, request
import os
import tempfile
import io
from lottery_validation.routes import lottery_validation_bp, allowed_file
from werkzeug.datastructures import FileStorage, Headers

# Create a Flask app for testing
app = Flask(__name__)
app.register_blueprint(lottery_validation_bp)

class LotteryValidationTests(unittest.TestCase):

    def setUp(self):
        # Set up Flask test client and app context
        self.app = app
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

        # Create a temporary upload folder path for mocking
        self.upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
        print("Running updated test_lottery_validation.py with corrected mock file")

    def test_allowed_file_valid_extension(self):
        """Test allowed_file function with valid extensions."""
        self.assertTrue(allowed_file('image.jpg'))
        self.assertTrue(allowed_file('image.jpeg'))
        self.assertTrue(allowed_file('image.PNG'))

    def test_allowed_file_invalid_extension(self):
        """Test allowed_file function with invalid extensions."""
        self.assertFalse(allowed_file('image.txt'))
        self.assertFalse(allowed_file('image.gif'))
        self.assertFalse(allowed_file('image'))

    @patch('tempfile.gettempdir')  # Mock gettempdir
    @patch('tempfile.NamedTemporaryFile')  # Mock NamedTemporaryFile
    @patch('tempfile.TemporaryFile')
    @patch('os.path.exists')
    @patch('os.makedirs')
    @patch('os.path.join')
    @patch('os.remove')
    @patch('lottery_validation.routes.process_lottery_ticket')
    @patch('lottery_validation.routes.store_result')
    @patch('builtins.open', new_callable=unittest.mock.mock_open, read_data=b'fake_image_data')
    def test_upload_image_success(self, mock_open, mock_store_result, mock_process_lottery_ticket, 
                                 mock_remove, mock_join, mock_makedirs, mock_exists,
                                 mock_tempfile, mock_named_tempfile, mock_gettempdir):
        """Test upload_image endpoint with a valid image."""
        # Mock the temporary directory
        mock_gettempdir.return_value = '/fake/temp/dir'

        # Mock NamedTemporaryFile to prevent real file creation
        mock_temp_file = MagicMock()
        mock_temp_file.write = MagicMock()
        mock_temp_file.read = MagicMock(return_value=b'fake_image_data')
        mock_temp_file.seek = MagicMock()
        mock_temp_file.name = '/fake/temp/dir/tmpfile'
        mock_temp_file.__enter__.return_value = mock_temp_file
        mock_temp_file.__exit__ = MagicMock()
        mock_named_tempfile.return_value = mock_temp_file
        mock_tempfile.return_value = mock_temp_file

        # Mock file system operations
        mock_exists.return_value = False
        mock_makedirs.return_value = None
        mock_join.side_effect = lambda *args: '/fake/path/image.jpg'
        mock_remove.return_value = None

        # Mock the lottery ticket processing
        mock_process_lottery_ticket.return_value = {
            "lotteryName": "MAHAJANA SAMPATHA",
            "drawDate": "THURSDAY, 24.04.2025",
            "validation": "Valid",
            "lotteryNumbers": "G 646568",
            "lotteryResults": "G 646568",
            "winningPrice": "Rs 1000000/="
        }
        mock_store_result.return_value = None

        # Create a mock file that behaves like a real FileStorage object
        file_content = b'fake_image_data'
        mock_file = FileStorage(
            stream=io.BytesIO(file_content),
            filename='test_image.jpg',
            content_type='image/jpeg'
        )

        # Simulate file upload using the test client
        response = self.client.post('/upload-image', 
                                    content_type='multipart/form-data',
                                    data={'image': mock_file})

        # Check response
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('image_id', data)
        self.assertTrue(data['image_id'].endswith('.jpg'))

    def test_upload_image_no_file(self):
        """Test upload_image endpoint with no file provided."""
        response = self.client.post('/upload-image', 
                                    content_type='multipart/form-data',
                                    data={})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data['error'], 'No image file provided')

    @patch('tempfile.gettempdir')  # Mock gettempdir
    @patch('tempfile.NamedTemporaryFile')  # Mock NamedTemporaryFile
    @patch('tempfile.TemporaryFile')
    def test_upload_image_invalid_file_type(self, mock_tempfile, mock_named_tempfile, 
                                            mock_gettempdir):
        """Test upload_image endpoint with an invalid file type."""
        # Mock the temporary directory
        mock_gettempdir.return_value = '/fake/temp/dir'

        # Mock NamedTemporaryFile to prevent real file creation
        mock_temp_file = MagicMock()
        mock_temp_file.write = MagicMock()
        mock_temp_file.read = MagicMock(return_value=b'fake_image_data')
        mock_temp_file.seek = MagicMock()
        mock_temp_file.name = '/fake/temp/dir/tmpfile'
        mock_temp_file.__enter__.return_value = mock_temp_file
        mock_temp_file.__exit__ = MagicMock()
        mock_named_tempfile.return_value = mock_temp_file
        mock_tempfile.return_value = mock_temp_file

        # Create a mock file with an invalid extension
        file_content = b'fake_image_data'
        mock_file = FileStorage(
            stream=io.BytesIO(file_content),
            filename='test_image.txt',
            content_type='text/plain'
        )

        # Simulate file upload using the test client
        response = self.client.post('/upload-image',
                                    content_type='multipart/form-data',
                                    data={'image': mock_file})

        # Check response
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data['error'], 'Invalid file type. Only JPG, JPEG, and PNG are allowed.')

    @patch('lottery_validation.routes.get_result')
    def test_process_ticket_success(self, mock_get_result):
        """Test process_ticket endpoint with a valid image_id."""
        mock_get_result.return_value = {
            "lotteryName": "MAHAJANA SAMPATHA",
            "drawDate": "THURSDAY, 24.04.2025",
            "validation": "Valid",
            "lotteryNumbers": "G 646568",
            "lotteryResults": "G 646568",
            "winningPrice": "Rs 1000000/="
        }

        response = self.client.post('/process-ticket',
                                    json={'image_id': 'test_image.jpg'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['lotteryName'], 'MAHAJANA SAMPATHA')
        self.assertEqual(data['winningPrice'], 'Rs 1000000/=')

    @patch('lottery_validation.routes.get_result')
    def test_process_ticket_no_image_id(self, mock_get_result):
        """Test process_ticket endpoint with no image_id."""
        response = self.client.post('/process-ticket',
                                    json={})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data['error'], 'No image_id provided')

    @patch('lottery_validation.routes.get_result')
    def test_process_ticket_result_not_found(self, mock_get_result):
        """Test process_ticket endpoint when result is not found."""
        mock_get_result.return_value = None

        response = self.client.post('/process-ticket',
                                    json={'image_id': 'test_image.jpg'})
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertEqual(data['error'], 'Result not found or has expired')

if __name__ == '__main__':
    unittest.main()