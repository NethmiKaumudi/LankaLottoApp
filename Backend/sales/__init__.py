import logging
from flask import Blueprint

# Configure logging
logger = logging.getLogger(__name__)

# Define Blueprint
sales_bp = Blueprint('sales', __name__, url_prefix='/sales')

# Import routes to attach them to the Blueprint
try:
    from .routes import *  # Import all routes
    logger.info("Sales routes imported successfully")
except Exception as e:
    logger.error(f"Error importing sales routes: {str(e)}")
    raise