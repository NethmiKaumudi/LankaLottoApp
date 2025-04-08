from pymongo import MongoClient
from config.config import Config


def seed_prize():
    # Connect to the MongoDB client
    client = MongoClient(Config.MONGO_URI)
    db = client.get_database()
    prize_collection = db['prize_structure']

    # Prize Data for Mahajana Sampatha
    mahajana_prizes = [
        {"lottery_name": "Mahajana Sampatha", "pattern": "Letter and 6 Numbers Correct", "prize": "Rs. 20,000,000"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "6 Numbers Correct", "prize": "Rs. 2,500,000"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Last 5 Numbers Correct", "prize": "Rs. 100,000"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Last 4 Numbers Correct", "prize": "Rs. 15,000"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Last 3 Numbers Correct", "prize": "Rs. 2,000"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Last 2 Numbers Correct", "prize": "Rs. 200"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Last Number Correct", "prize": "Rs. 40"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "First 5 Numbers Correct", "prize": "Rs. 100,000"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "First 4 Numbers Correct", "prize": "Rs. 2,000"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "First 3 Numbers Correct", "prize": "Rs. 200"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "First 2 Numbers Correct", "prize": "Rs. 80"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "First Number Correct", "prize": "Rs. 40"},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Letter Correct", "prize": "Rs. 40"},
    ]

    # Prize Data for Govisetha
    govisetha_prizes = [
        {"lottery_name": "Govisetha", "pattern": "Letter and 4 Numbers Correct", "prize": "Rs. 60,000,000"},
        {"lottery_name": "Govisetha", "pattern": "4 Numbers Correct", "prize": "Rs. 2,000,000"},
        {"lottery_name": "Govisetha", "pattern": "Letter and Any 3 Numbers Correct", "prize": "Rs. 250,000"},
        {"lottery_name": "Govisetha", "pattern": "Any 3 Numbers Correct", "prize": "Rs. 5,000"},
        {"lottery_name": "Govisetha", "pattern": "Letter and Any 2 Numbers Correct", "prize": "Rs. 2,000"},
        {"lottery_name": "Govisetha", "pattern": "Any 2 Numbers Correct", "prize": "Rs. 200"},
        {"lottery_name": "Govisetha", "pattern": "Letter and Any Number Correct", "prize": "Rs. 200"},
        {"lottery_name": "Govisetha", "pattern": "Any Number Correct", "prize": "Rs. 40"},
        {"lottery_name": "Govisetha", "pattern": "Letter Correct", "prize": "Rs. 40"},
        {"lottery_name": "Govisetha", "pattern": "Special Letter Correct", "prize": "Rs. 40"},
    ]

    # Insert prize structure data into MongoDB
    existing_data = prize_collection.count_documents({})  # Check if there is existing data
    
    if existing_data == 0:
        # Insert prize structure data for both lotteries
        prize_collection.insert_many(mahajana_prizes + govisetha_prizes)
        print("Prize Structure data seeded successfully.")
    else:
        print("Prize Structure data already exists.")

