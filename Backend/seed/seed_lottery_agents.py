from pymongo import MongoClient
import random
from config.config import Config

# List of agent names provided
AGENT_NAMES = [
    "Nimal Abesekara",
    "Kamal Sahabandu",
    "Jayanthi Weeraccon",
    "Malakanthi",
    "Sisira Perera",
    "Priyantha Gunasekara",
    "Indika Rajapaksha",
    "Lalitha Wickramasinghe",
    "Saman Kumara",
    "Dilani Fernando",
    "Mahesh Rukshan",
    "Nadeesha Wijesuriya",
    "Tharindu Silva",
    "Chandima Perera",
    "Dinesh Jayawardena",
    "Sushantha Kariyawasam",
    "Sanduni Pathirana",
    "Ruvini Seneviratne",
    "Vishal Wijekoon",
    "Duminda Weerasinghe",
    "Anusha Dissanayake",
    "Rashmi Herath",
    "Lahiru Perera",
    "Madhusanka Malwattage",
    "Tissa Samarasinghe",
    "Niroshan Ranasinghe",
    "Dulani Aravinda",
    "Mahinda Mendis",
    "Kumari Jayakody",
    "Ravi Amarasinghe",
    "Vimukthi Wickramasinghe",
    "Chaminda Gunaratne",
    "Dilanthi Jayasinghe",
    "Nimali Hettiarachchi",
    "Pradeep Perera",
    "Priyanka Ranatunga",
    "Sujeewa Rajapaksha",
    "Prasanna Kumara",
    "Kanchana Wijewardene",
    "Uthpala Rajapaksha",
    "Dinesh Perera",
    "Aishwarya Gunawardena",
    "Sandeepa De Silva",
    "Siriwardena Dissanayake",
    "Ajith Kumarasinghe",
    "Buddhi Perera",
    "Chatura Perera",
    "Mihira Fernando",
    "Gayani Priyadarshani",
    "Lakmal Samarasinghe",
    "Piyumini Karunarathne",
    "Rajitha Karunarathne",
    "Nalaka Wijesuriya",
    "Tushara Gunathilake",
    "Subhani Khatun",
    "Charitha Jayaweera",
    "Senaka Abeysinghe",
    "Sangeetha Munasinghe",
    "Pradeep Kumara",
    "Asela Perera",
    "Kanthi Rathnayake",
    "Piumi Rajapaksha",
    "Tharanga Lakmal",
    "Dinesh Rajapakse",
    "Muthumani Rajapaksha",
    "Ariyanayaka Perera",
    "Indrajith Abeykoon",
    "Kasun Prasanna",
    "Ruwani Perera",
    "Samith Wijewickrama",
    "Vijitha Gunathilaka",
    "Tharushi Jayasuriya",
    "Sashini Karunarathna",
    "Shashini Perera",
    "Kavindi Liyanage",
    "Indika Gunathilaka",
    "Ravindra Liyanage",
    "Chamikara Wijesiri",
    "Sujan Fernando",
    "Madhuri Harischandra",
    "Subodhani Dissanayake",
    "Kaveesha Rathnayake",
    "Piumi Premarathna",
    "Nayanathara Perera",
    "Tina Kumari",
    "Chanaka Mahendra",
    "Ravindu Abeyratne",
    "Hiruni Chandrasiri",
    "Ajantha Amarasekara",
    "Sanjani Kanchana",
    "Dinesh Kularatne",
    "Chathuranga Kalubowila",
    "Amara Weerasinghe",
    "Amara Weerasing"
]

def seed_lottery_agents():
    client = MongoClient(Config.MONGO_URI)
    db = client.get_database()
    lottery_agents_collection = db['lottery_agents']

    if lottery_agents_collection.count_documents({}) == 0:
        agents = []
        for agent_name in AGENT_NAMES:
            # Generate a 4-digit number and format it with leading zeros
            nlb_number = random.randint(0, 9999)
            dlb_number = random.randint(0, 9999)
            agent = {
                'agent_name': agent_name,
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