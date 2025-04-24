# Backend/users/__init__.py
from flask import Blueprint

users_bp = Blueprint('users_bp', __name__)
print("Importing routes in users/__init__.py")
from . import routes
print("Routes imported successfully")