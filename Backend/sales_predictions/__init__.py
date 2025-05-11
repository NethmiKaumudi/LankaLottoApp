#sales_predicion/__init__.py
from flask import Blueprint

sales_pred_bp = Blueprint('sales_pred', __name__)

# Import routes after creating the blueprint to avoid circular imports
from . import routes