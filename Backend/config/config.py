# config/config.py
from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', os.urandom(24))
    MONGO_URI = os.getenv('MONGO_URI')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    TWILIO_SID = os.getenv('TWILIO_SID')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE = os.getenv('TWILIO_PHONE_NUMBER')
    SALES_DATA_PATH = 'data/sales_data_full_two_year.csv'