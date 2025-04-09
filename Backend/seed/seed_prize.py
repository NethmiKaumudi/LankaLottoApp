from pymongo import MongoClient
from config.config import Config

def seed_prize():
    # Connect to the MongoDB client
    client = MongoClient(Config.MONGO_URI)
    db = client.get_database()
    prize_collection = db['prize_structure']

    # Prize Data for Mahajana Sampatha (store prize as integer)
    mahajana_prizes = [
        {"lottery_name": "Mahajana Sampatha", "pattern": "Letter and 6 Numbers Correct", "prize": 20000000},
        {"lottery_name": "Mahajana Sampatha", "pattern": "6 Numbers Correct", "prize": 2500000},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Last 5 Numbers Correct", "prize": 100000},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Last 4 Numbers Correct", "prize": 15000},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Last 3 Numbers Correct", "prize": 2000},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Last 2 Numbers Correct", "prize": 200},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Last Number Correct", "prize": 40},
        {"lottery_name": "Mahajana Sampatha", "pattern": "First 5 Numbers Correct", "prize": 100000},
        {"lottery_name": "Mahajana Sampatha", "pattern": "First 4 Numbers Correct", "prize": 2000},
        {"lottery_name": "Mahajana Sampatha", "pattern": "First 3 Numbers Correct", "prize": 200},
        {"lottery_name": "Mahajana Sampatha", "pattern": "First 2 Numbers Correct", "prize": 80},
        {"lottery_name": "Mahajana Sampatha", "pattern": "First Number Correct", "prize": 40},
        {"lottery_name": "Mahajana Sampatha", "pattern": "Letter Correct", "prize": 40},
    ]

    # Prize Data for Govisetha (store prize as integer)
    govisetha_prizes = [
        {"lottery_name": "Govisetha", "pattern": "Letter and 4 Numbers Correct", "prize": 60000000},
        {"lottery_name": "Govisetha", "pattern": "4 Numbers Correct", "prize": 2000000},
        {"lottery_name": "Govisetha", "pattern": "Letter and Any 3 Numbers Correct", "prize": 250000},
        {"lottery_name": "Govisetha", "pattern": "Any 3 Numbers Correct", "prize": 5000},
        {"lottery_name": "Govisetha", "pattern": "Letter and Any 2 Numbers Correct", "prize": 2000},
        {"lottery_name": "Govisetha", "pattern": "Any 2 Numbers Correct", "prize": 200},
        {"lottery_name": "Govisetha", "pattern": "Letter and Any Number Correct", "prize": 200},
        {"lottery_name": "Govisetha", "pattern": "Any Number Correct", "prize": 40},
        {"lottery_name": "Govisetha", "pattern": "Letter Correct", "prize": 40},
        {"lottery_name": "Govisetha", "pattern": "Special Letter Correct", "prize": 40},
    ]

    # Insert prize structure data into MongoDB
    existing_data = prize_collection.count_documents({})  # Check if there is existing data
    
    if existing_data == 0:
        # Insert prize structure data for both lotteries
        prize_collection.insert_many(mahajana_prizes + govisetha_prizes)
        print("Prize Structure data seeded successfully.")
    else:
        # Clear existing data and re-seed
        prize_collection.delete_many({})
        prize_collection.insert_many(mahajana_prizes + govisetha_prizes)
        print("Prize Structure data re-seeded successfully.")

    # Close the MongoDB client connection
    client.close()