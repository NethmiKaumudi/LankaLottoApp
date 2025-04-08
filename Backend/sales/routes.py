from flask import jsonify, request
from . import sales_bp
from .sales_prediction_suggestions import load_data, add_lag_features, predict_sales
from config.config import Config
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Endpoint for weekly predictions
@sales_bp.route('/predict/week', methods=['GET'])
def predict_week():
    try:
        daily_totals = load_data(Config.SALES_DATA_PATH)
        daily_totals = add_lag_features(daily_totals)
        predictions, summary, suggestions = predict_sales(daily_totals, 'week')

        response = {
            'predictions': predictions,
            'summary': summary,
            'suggestions': suggestions
        }
        return jsonify(response), 200
    except Exception as e:
        logger.error(f"Error in predict_week: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

# Endpoint for monthly predictions
@sales_bp.route('/predict/month', methods=['GET'])
def predict_month():
    try:
        daily_totals = load_data(Config.SALES_DATA_PATH)
        daily_totals = add_lag_features(daily_totals)
        predictions, summary, suggestions = predict_sales(daily_totals, 'month')

        response = {
            'predictions': predictions,
            'summary': summary,
            'suggestions': suggestions
        }
        return jsonify(response), 200
    except Exception as e:
        logger.error(f"Error in predict_month: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500