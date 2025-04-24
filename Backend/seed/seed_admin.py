# seed/seed_admin.py
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from config.config import Config

def seed_admin():
    client = MongoClient(Config.MONGO_URI)
    db = client.get_database()
    admins_collection = db['admins']  # Separate table for admins

    admin_exists = admins_collection.find_one({'role': 'admin'})
    if not admin_exists:
        admin_data = {
            'username': 'admin',
            'password': generate_password_hash('admin123'),
            'role': 'admin'
        }
        admins_collection.insert_one(admin_data)
        print("Admin seeded successfully.")
    else:
        print("Admin already exists.")