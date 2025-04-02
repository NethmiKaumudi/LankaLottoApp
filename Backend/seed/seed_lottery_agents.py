# seed/seed_lottery_agents.py
from pymongo import MongoClient
import random
from config.config import Config

# Lists of common Sri Lankan names
MALE_FIRST_NAMES = [
    "Amal", "Nimal", "Kamal", "Sunil", "Ranil", "Saman", "Dilan", "Chathura", "Lahiru", "Tharindu",
    "Sanjaya", "Priyantha", "Ruwan", "Asanka", "Duminda", "Nuwan", "Chaminda", "Janaka", "Sampath", "Upul"
]

FEMALE_FIRST_NAMES = [
    "Nadeesha", "Sanduni", "Tharushi", "Kavya", "Anjali", "Shanika", "Dilani", "Pavithra", "Madhusha", "Chathurika",
    "Sewwandi", "Nirosha", "Gayani", "Ruwanthi", "Ishara", "Manjula", "Sriyani", "Kanchana", "Deepika", "Wasanthi"
]

SURNAMES = [
    "Perera", "Silva", "Fernando", "Jayasinghe", "Gunawardena", "Weerasinghe", "Bandara", "Kumara", "Rathnayake", "Wickramasinghe",
    "De Silva", "Jayawardena", "Dissanayake", "Karunaratne", "Rajapaksa", "Fonseka", "Samarasinghe", "Liyanage", "Abeysinghe", "Herath"
]

def generate_sri_lankan_name():
    # Randomly choose gender
    is_male = random.choice([True, False])
    first_name = random.choice(MALE_FIRST_NAMES if is_male else FEMALE_FIRST_NAMES)
    surname = random.choice(SURNAMES)
    return f"{first_name} {surname}"

def seed_lottery_agents():
    client = MongoClient(Config.MONGO_URI)
    db = client.get_database()
    lottery_agents_collection = db['lottery_agents']

    if lottery_agents_collection.count_documents({}) == 0:
        agents = []
        for i in range(200):
            # Generate a 4-digit number and format it with leading zeros
            nlb_number = random.randint(0, 9999)
            dlb_number = random.randint(0, 9999)
            agent = {
                'agent_name': generate_sri_lankan_name(),
                'nlb_no': f'N{nlb_number:04d}',  # e.g., N0125
                'dlb_no': f'D{dlb_number:04d}'   # e.g., D5632
            }
            agents.append(agent)
        lottery_agents_collection.insert_many(agents)
        print(f"Seeded {len(agents)} lottery agents successfully.")
    else:
        print("Lottery agents already seeded.")

if __name__ == '__main__':
    seed_lottery_agents()