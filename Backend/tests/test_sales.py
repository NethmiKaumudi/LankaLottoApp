import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from sales.routes import sales_bp
from bson.objectid import ObjectId
import jwt
import datetime

class SalesTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(sales_bp)
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True
        self.valid_token = jwt.encode({
            'role': 'admin',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, 'secret_key', algorithm='HS256')

    @patch('sales.routes.sales_collection')
    @patch('sales.routes.agents_collection')
    def test_add_sales_success(self, mock_agents, mock_sales):
        mock_agents.find_one.return_value = {'_id': ObjectId(), 'Agent_Name': 'Test Agent', 'NLB_DLB_No': '123', 'Status': True}
        mock_sales.find_one.return_value = None
        mock_sales.insert_one.return_value = MagicMock(inserted_id='sales_id')

        data = {
            'agent_id': str(ObjectId()),
            'date_of_sale': '2025-04-24',
            'province': 'Western',
            'district': 'Colombo',
            'area': 'Colombo 7',
            'dlb_sale': 500,
            'nlb_sale': 500,
            'total_sale': 1000
        }
        response = self.client.post('/sales/save', json=data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()['message'], 'Sales data saved successfully')

    @patch('sales.routes.agents_collection')
    def test_add_sales_invalid_agent(self, mock_agents):
        mock_agents.find_one.return_value = None

        data = {
            'agent_id': str(ObjectId()),
            'date_of_sale': '2025-04-24',
            'province': 'Western',
            'district': 'Colombo',
            'area': 'Colombo 7',
            'dlb_sale': 500,
            'nlb_sale': 500,
            'total_sale': 1000
        }
        response = self.client.post('/sales/save', json=data)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()['message'], 'Agent not found or not approved')

    @patch('sales.routes.sales_collection')
    @patch('sales.routes.agents_collection')
    def test_update_sale_success(self, mock_agents, mock_sales):
        mock_agents.find_one.return_value = {'_id': ObjectId(), 'Agent_Name': 'Test Agent', 'NLB_DLB_No': '123', 'Status': True}
        mock_sales.update_one.return_value = MagicMock(modified_count=1)

        data = {
            'agent_id': str(ObjectId()),
            'date_of_sale': '2025-04-24',
            'province': 'Western',
            'district': 'Colombo',
            'area': 'Colombo 7',
            'dlb_sale': 600,
            'nlb_sale': 600,
            'total_sale': 1200
        }
        response = self.client.put('/sales/sales_id', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['message'], 'Sales data updated successfully')

    def test_get_all_sales_unauthorized(self):
        response = self.client.get('/sales/all')
        self.assertEqual(response.status_code, 401)

    @patch('sales.routes.sales_collection')
    def test_get_all_sales_success(self, mock_sales):
        mock_sales.find.return_value = [{'_id': 'sales_id', 'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()}]
        headers = {'Authorization': f'Bearer {self.valid_token}'}
        response = self.client.get('/sales/all', headers=headers)
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()