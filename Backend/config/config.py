# config/config.py
from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', os.urandom(24))
    JWT_SECRET = os.getenv('JWT_SECRET', os.urandom(24))       # Used for signing/verifying JWTs
    JWT_TOKEN_LOCATION = ['headers']  # Specify token location
    JWT_HEADER_NAME = 'Authorization'  # Add this to specify the header name (default is 'Authorization')
    JWT_HEADER_TYPE = 'Bearer'
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # Token expiry in seconds (1 hour)
    MONGO_URI = os.getenv('MONGO_URI')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    VONAGE_API_KEY = os.getenv('VONAGE_API_KEY')
    VONAGE_API_SECRET = os.getenv('VONAGE_API_SECRET')
    VONAGE_FROM = os.getenv('VONAGE_FROM')
    SALES_DATA_PATH = 'data/sales_data_full_two_year.csv'
    UPLOAD_FOLDER = "uploads"  # Directory to store uploaded images
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}