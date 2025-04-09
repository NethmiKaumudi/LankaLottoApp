# Backend/lottery_validation/__init__.py
from flask import Blueprint

# Create the lottery_validation blueprint
lottery_validation_bp = Blueprint('lottery_validation', __name__)

# Import the routes to register them with the blueprint
from . import routes