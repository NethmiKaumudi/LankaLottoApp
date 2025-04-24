import unittest
from unittest.mock import patch
from flask import Flask
from sales_predictions.routes import sales_pred_bp
import logging

# Suppress logging during tests to avoid confusion
logging.getLogger('sales_predictions.routes').setLevel(logging.CRITICAL)

class SalesPredictionTestCase(unittest.TestCase):

    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(sales_pred_bp, url_prefix="/sales")
        self.client = self.app.test_client()

    @patch('sales_predictions.routes.load_data')
    @patch('sales_predictions.routes.add_lag_features')
    @patch('sales_predictions.routes.predict_sales')
    def test_predict_week_success(self, mock_predict_sales, mock_add_lag, mock_load_data):
        # Mock the return values for a successful prediction
        mock_load_data.return_value = 'mocked_data'
        mock_add_lag.return_value = 'processed_data'
        mock_predict_sales.return_value = (
            [{'Date': '2025-04-24', 'NLB Predicted Tickets': 1200, 'DLB Predicted Tickets': 800, 'Total Predicted Tickets': 2000}],
            {'period_label': 'Week (2025-04-24–2025-04-30)', 'total_sales': 14000, 'avg_daily_sales': 2000},
            ['Improve marketing efforts']
        )

        response = self.client.get('/sales/predict/week')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('predictions', data)
        self.assertIn('summary', data)
        self.assertIn('suggestions', data)
        self.assertEqual(data['summary']['period_label'], 'Week (2025-04-24–2025-04-30)')
        self.assertEqual(data['predictions'][0]['Total Predicted Tickets'], 2000)

    @patch('sales_predictions.routes.load_data', side_effect=Exception("Failed to load data"))
    def test_predict_week_failure(self, mock_load_data):
        response = self.client.get('/sales/predict/week')
        self.assertEqual(response.status_code, 500)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Failed to load data')

    @patch('sales_predictions.routes.load_data')
    @patch('sales_predictions.routes.add_lag_features')
    @patch('sales_predictions.routes.predict_sales')
    def test_predict_month_success(self, mock_predict_sales, mock_add_lag, mock_load_data):
        # Mock the return values for a successful prediction
        mock_load_data.return_value = 'mocked_data'
        mock_add_lag.return_value = 'processed_data'
        mock_predict_sales.return_value = (
            [{'Date': '2025-04-24', 'NLB Predicted Tickets': 5000, 'DLB Predicted Tickets': 3000, 'Total Predicted Tickets': 8000}],
            {'period_label': 'Period (2025-04-24–2025-05-23)', 'total_sales': 240000, 'avg_daily_sales': 8000},
            ['Launch special campaign']
        )

        response = self.client.get('/sales/predict/month')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('predictions', data)
        self.assertIn('summary', data)
        self.assertIn('suggestions', data)
        self.assertEqual(data['summary']['period_label'], 'Period (2025-04-24–2025-05-23)')
        self.assertEqual(data['predictions'][0]['Total Predicted Tickets'], 8000)

    @patch('sales_predictions.routes.load_data', side_effect=Exception("Failed to load monthly data"))
    def test_predict_month_failure(self, mock_load_data):
        response = self.client.get('/sales/predict/month')
        self.assertEqual(response.status_code, 500)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Failed to load monthly data')

    # Add a test for an invalid period
    def test_invalid_period(self):
        response = self.client.get('/sales/predict/invalid')
        self.assertEqual(response.status_code, 404)  # Flask returns 404 for unknown routes

if __name__ == '__main__':
    unittest.main()