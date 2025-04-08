from flask import Blueprint

sales_bp = Blueprint('sales', __name__)

# Import routes after creating the blueprint to avoid circular imports
from . import routes