import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from users.routes import users_bp
from bson.objectid import ObjectId
import jwt
import datetime
import bcrypt

class UsersTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(users_bp)
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True
        self.valid_token = jwt.encode({
            'role': 'admin',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, 'secret_key', algorithm='HS256')
        self.agent_token = jwt.encode({
            'contact_no': '+94123456789',
            'role': 'agent',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, 'secret_key', algorithm='HS256')

    @patch('users.routes.agents_collection')
    def test_register_success(self, mock_agents):
        mock_agents.find_one.side_effect = [None, None]  # No existing agent with same NLB_DLB_No or Contact_No
        mock_agents.insert_one.return_value = MagicMock()

        data = {
            'agent_name': 'Test Agent',
            'nlb_dlb_no': '12345',
            'contact_no': '+94123456789',
            'address': '123 Main St',
            'password': 'password123'
        }
        response = self.client.post('/users/register', json=data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()['message'], 'Registration successful. Awaiting admin approval.')

    @patch('users.routes.agents_collection')
    def test_request_otp_success(self, mock_agents):
        mock_agents.find_one.return_value = {'Contact_No': '+94123456789', 'Status': True}
        mock_agents.update_one.return_value = MagicMock()
        with patch('requests.post', return_value=MagicMock(status_code=200)):
            data = {'contact_no': '+94123456789'}
            response = self.client.post('/users/request-otp', json=data)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json()['message'], 'OTP sent to your mobile number.')

    @patch('users.routes.agents_collection')
    def test_verify_otp_success(self, mock_agents):
        mock_agents.find_one.return_value = {
            'Contact_No': '+94123456789',
            'otp': '123456',
            'otp_expiry': datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
        }
        mock_agents.update_one.return_value = MagicMock()

        data = {'contact_no': '+94123456789', 'otp': '123456'}
        response = self.client.post('/users/verify-otp', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['message'], 'Login successful.')

    @patch('users.routes.admins_collection')
    def test_admin_login_success(self, mock_admins):
        hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        mock_admins.find_one.return_value = {'username': 'admin', 'password': hashed_password}

        data = {'username': 'admin', 'password': 'admin123'}
        response = self.client.post('/users/admin-login', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['message'], 'Admin login successful.')

    @patch('users.routes.agents_collection')
    def test_get_pending_agents_success(self, mock_agents):
        mock_agents.find.return_value = [{'_id': ObjectId(), 'Agent_Name': 'Test Agent'}]
        headers = {'Authorization': f'Bearer {self.valid_token}'}
        response = self.client.get('/users/pending-agents', headers=headers)
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()