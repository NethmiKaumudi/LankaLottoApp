import requests
import base64
import cv2
import numpy as np
from pyzbar.pyzbar import decode
import re
from bs4 import BeautifulSoup
import logging
import asyncio
import nest_asyncio
from datetime import datetime
import time
import random
import os
from pymongo import MongoClient
from config.config import Config
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Connect to MongoDB (only for prize structure)
client = MongoClient(Config.MONGO_URI)
db = client.get_database()
prize_collection = db['prize_structure']

# In-memory storage for ticket results
ticket_results = {}  # Format: {image_id: {"result": result, "created_at": timestamp}}

# Gemini API keys from environment
gemini_api_keys = [
    os.getenv("GEMINI_API_KEY", "AIzaSyCpznkr8ZjCRdJCO-4JjpAaEq1XB5qlFrk"),
    os.getenv("GEMINI_API_KEY2", "AIzaSyBo03lpx0jd2QtW1Y6GiWD-5-NComEWyfA")
]
current_api_key_index = 0

# Apply nest_asyncio for nested event loops
nest_asyncio.apply()

# Rate Limiting Configuration
MAX_RETRIES = 3
INITIAL_BACKOFF = 1  # seconds

# Cleanup configuration
RESULT_TTL = 300  # 5 minutes in seconds

def cleanup_old_results():
    """Remove results older than RESULT_TTL seconds from the in-memory storage."""
    current_time = time.time()
    expired_keys = [
        image_id for image_id, data in ticket_results.items()
        if (current_time - data["created_at"]) > RESULT_TTL
    ]
    for image_id in expired_keys:
        del ticket_results[image_id]
    logging.info(f"Cleaned up {len(expired_keys)} expired ticket results.")

def store_result(image_id, result):
    """Store the processing result in the in-memory dictionary."""
    cleanup_old_results()
    ticket_results[image_id] = {
        "result": result,
        "created_at": time.time()
    }
    logging.info(f"Stored result for image_id: {image_id}")

def get_result(image_id):
    """Retrieve the processing result from the in-memory dictionary."""
    cleanup_old_results()
    result = ticket_results.get(image_id, {}).get("result")
    if result is None:
        logging.info(f"No result found for image_id: {image_id}")
    else:
        logging.info(f"Retrieved result for image_id {image_id}: {result}")
    return result

def get_current_gemini_key():
    global current_api_key_index
    return gemini_api_keys[current_api_key_index % len(gemini_api_keys)]

def switch_gemini_key():
    global current_api_key_index
    current_api_key_index = (current_api_key_index + 1) % len(gemini_api_keys)
    logging.warning(f"Switched Gemini API key to index {current_api_key_index}.")

def send_to_gemini_api(image_data, prompt, retry_count=0):
    api_key = get_current_gemini_key()
    try:
        image_base64 = base64.b64encode(image_data).decode("utf-8")
    except Exception as e:
        return f"Error encoding image: {e}"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": "image/jpeg", "data": image_base64}}
                ]
            }
        ]
    }

    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        if 'candidates' in result and result['candidates']:
            return result['candidates'][0]['content']['parts'][0]['text'].strip()
        return "Error: No valid response from Gemini API."
    except requests.exceptions.RequestException as e:
        if hasattr(e.response, 'status_code') and e.response.status_code == 429:
            if retry_count < MAX_RETRIES:
                backoff_time = (INITIAL_BACKOFF * (2 ** retry_count)) + random.uniform(0, 1)
                time.sleep(backoff_time)
                return send_to_gemini_api(image_data, prompt, retry_count + 1)
            switch_gemini_key()
            return send_to_gemini_api(image_data, prompt, 0)
        return f"Error: Failed API request: {e}"

def decode_qr_code(image_data):
    qr_prompt = "Extract the QR code data from this lottery ticket image in the format: '[LotteryName] [DrawNo] [DrawDate] [Serial] [Letter] [Digits] [URL]'. Example: 'Mahajana Sampatha 5775 14.03.2025 080057750375810 G 646568 http://r.nlb.lk/080057750375810G646568'."
    try:
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return f"Error: Could not decode image", None, False
        decoded_objects = decode(img)
        qr_data_raw = None
        if decoded_objects:
            qr_data_raw = decoded_objects[0].data.decode('utf-8')
            logging.info(f"QR code decoded: {qr_data_raw}")
            pattern = r'(Mahajana Sampatha|Govisetha) \d+ (\d{2}\.\d{2}\.\d{4}|\d{4}/\d{2}/\d{2}) (\d+) ([A-Z]) (\d{4,6}) http://r\.nlb\.lk/\d+[A-Z]\d{4,6}'
            if re.search(pattern, qr_data_raw):
                return qr_data_raw, qr_data_raw, True
            else:
                logging.warning("QR data format incorrect, falling back to Gemini API for QR data.")
                gemini_qr_data = send_to_gemini_api(image_data, qr_prompt)
                return gemini_qr_data, qr_data_raw, False

        logging.info("No QR code found. Falling back to Gemini API for QR data.")
        gemini_qr_data = send_to_gemini_api(image_data, qr_prompt)
        return gemini_qr_data, qr_data_raw, False
    except Exception as e:
        logging.error(f"Error decoding QR code: {e}")
        gemini_qr_data = send_to_gemini_api(image_data, qr_prompt)
        return gemini_qr_data, None, False

def extract_lottery_details_from_qr(qr_code_data):
    if "Error" in qr_code_data:
        return qr_code_data

    pattern = r'(Mahajana Sampatha|Govisetha) (\d+) (\d{2}\.\d{2}\.\d{4}|\d{4}/\d{2}/\d{2}) (\d+) ([A-Z]) (\d{4,6}) (http://r\.nlb\.lk/\S+)'
    match = re.search(pattern, qr_code_data, re.IGNORECASE)
    if match:
        draw_date = match.group(3)
        if '/' in draw_date:
            draw_date = datetime.strptime(draw_date, '%Y/%m/%d').strftime('%d.%m.%Y')
        return {
            "lottery_name": match.group(1),
            "draw_no": match.group(2),
            "draw_date": draw_date,
            "serial": match.group(4),
            "letter": match.group(5),
            "numbers": match.group(6),
            "url": match.group(7)
        }
    return "Could not extract lottery details from QR code."

def extract_face_numbers(image_data, lottery_name):
    face_prompt = f"Extract the ticket numbers from the face of this {lottery_name} lottery ticket image in the format: '[Letter] [Digits]'. The [Letter] must be a single uppercase letter (A-Z), and [Digits] must be exactly 4 or 6 digits depending on the lottery type. Example for Mahajana Sampatha: 'G 646568', Example for Govisetha: 'A 1234'."
    gemini_face_data = send_to_gemini_api(image_data, face_prompt)
    match = re.search(r'([A-Z])\s*(\d{4,6})', gemini_face_data)
    if match:
        return f"{match.group(1)} {match.group(2)}"
    return "Could not extract face numbers."

def validate_ticket(qr_details, face_numbers, pyzbar_success):
    if isinstance(qr_details, str):
        return "⚠️ Invalid: Could not extract QR details"

    qr_letter = qr_details.get('letter', 'Unknown')
    qr_numbers = qr_details.get('numbers', 'Unknown')
    qr_combo = f"{qr_letter} {qr_numbers}"
    face_combo = face_numbers

    is_qr_letter_valid = bool(re.match(r'^[A-Z]$', qr_letter))
    expected_length = 6 if qr_details.get('lottery_name') == "Mahajana Sampatha" else 4
    is_qr_numbers_valid = bool(re.match(r'^\d{' + str(expected_length) + r'}$', qr_numbers))
    is_face_valid = bool(re.match(r'^[A-Z]\s\d{' + str(expected_length) + r'}$', face_combo))

    source = "pyzbar" if pyzbar_success else "Gemini"
    if is_qr_letter_valid and is_qr_numbers_valid and is_face_valid:
        if qr_combo == face_combo:
            return f"✅ Valid (QR {source}: {qr_combo}, Face Gemini: {face_combo})"
        else:
            return f"⚠️ Invalid: Ticket mismatch (QR {source}: {qr_combo}, Face Gemini: {face_combo})"
    else:
        issues = []
        if not is_qr_letter_valid:
            issues.append(f"QR Letter invalid: {qr_letter}")
        if not is_qr_numbers_valid:
            issues.append(f"QR Numbers invalid: {qr_numbers} (expected {expected_length} digits)")
        if not is_face_valid:
            issues.append(f"Face Numbers invalid: {face_combo} (expected {expected_length} digits)")
        return f"⚠️ Invalid: {'; '.join(issues)} (QR {source}: {qr_combo}, Face Gemini: {face_combo})"

def get_winning_numbers_from_nlb(lottery_name, draw_no):
    chromedriver_path = r"C:\Users\DELL\Downloads\chromedriver-win64\chromedriver-win64\chromedriver.exe"
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    service = Service(chromedriver_path)
    driver = None
    try:
        driver = webdriver.Chrome(service=service, options=chrome_options)
        url = f"https://www.nlb.lk/results/{lottery_name.lower().replace(' ', '-')}/{draw_no}"
        driver.get(url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'lresult'))
        )
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        lresult_div = soup.find('div', class_='lresult')
        if not lresult_div:
            return "Result not found on NLB website."

        letter_element = lresult_div.find('li', class_='Letter')
        number_elements = lresult_div.find_all('li', class_=re.compile(r'Number-1'))
        if letter_element and number_elements:
            letter = letter_element.text.strip()
            numbers = ''.join([div.text.strip() for div in number_elements])
            return f"{letter} {numbers}"
        return "Winning details not found."
    except Exception as e:
        return f"Error fetching winning numbers: {e}"
    finally:
        if driver:
            driver.quit()

def determine_prize(tickets, winning_letter, winning_numbers, lottery_name):
    prize_structure = list(prize_collection.find({"lottery_name": lottery_name}))
    if not prize_structure:
        return [{"ticket": f"{ticket['letter']} {ticket['numbers']}", "prize": "Error: Prize structure not found for this lottery"} for ticket in tickets]

    num_length = 6 if lottery_name == "Mahajana Sampatha" else 4
    results = []
    for ticket in tickets:
        ticket_letter = ticket['letter']
        ticket_numbers = ticket['numbers']
        ticket_str = f"{ticket_letter}{ticket_numbers}"
        winning_str = f"{winning_letter}{winning_numbers}"

        if len(ticket_numbers) != num_length or len(winning_numbers) != num_length:
            results.append({
                "ticket": f"{ticket_letter} {ticket_numbers}",
                "prize": f"Error: Invalid number length (expected {num_length} digits)"
            })
            continue

        prize_won = None
        prize_amount_won = 0  # Track the highest prize amount

        for prize in prize_structure:
            pattern = prize["pattern"]
            prize_amount = prize["prize"]
            logging.info(f"Checking pattern: {pattern} for ticket {ticket_str} against winning {winning_str}")

            # Check for "Letter and X Numbers Correct"
            if "Letter and" in pattern and "Correct" in pattern:
                if ticket_str == winning_str:
                    if prize_amount > prize_amount_won:
                        prize_won = f"Rs. {prize_amount}"
                        prize_amount_won = prize_amount
                        logging.info(f"Matched 'Letter and Numbers Correct': Prize = {prize_won}")

            # Check for "X Numbers Correct" (without letter)
            elif "Numbers Correct" in pattern and "Letter" not in pattern:
                if ticket_numbers == winning_numbers:
                    if prize_amount > prize_amount_won:
                        prize_won = f"Rs. {prize_amount}"
                        prize_amount_won = prize_amount
                        logging.info(f"Matched 'Numbers Correct': Prize = {prize_won}")

            # Check for "Last X Numbers Correct" or "Last Number Correct"
            elif "Last" in pattern and "Correct" in pattern:
                try:
                    # Handle both "Last Number Correct" and "Last X Numbers Correct"
                    if "Number Correct" in pattern:
                        num_correct = 1  # Singular "Number" implies 1
                    else:
                        num_correct = int(pattern.split("Last")[1].split("Numbers")[0].strip())
                    ticket_last = ticket_numbers[-num_correct:]
                    winning_last = winning_numbers[-num_correct:]
                    logging.info(f"Comparing last {num_correct} numbers: {ticket_last} vs {winning_last}")
                    if ticket_last == winning_last:
                        if prize_amount > prize_amount_won:
                            prize_won = f"Rs. {prize_amount}"
                            prize_amount_won = prize_amount
                            logging.info(f"Matched 'Last {num_correct} Numbers Correct': Prize = {prize_won}")
                except (IndexError, ValueError) as e:
                    logging.error(f"Error parsing 'Last X Numbers Correct' pattern '{pattern}': {e}")

            # Check for "First X Numbers Correct" or "First Number Correct"
            elif "First" in pattern and "Correct" in pattern:
                try:
                    # Handle both "First Number Correct" and "First X Numbers Correct"
                    if "Number Correct" in pattern:
                        num_correct = 1  # Singular "Number" implies 1
                    else:
                        num_correct = int(pattern.split("First")[1].split("Numbers")[0].strip())
                    ticket_first = ticket_numbers[:num_correct]
                    winning_first = winning_numbers[:num_correct]
                    logging.info(f"Comparing first {num_correct} numbers: {ticket_first} vs {winning_first}")
                    if ticket_first == winning_first:
                        if prize_amount > prize_amount_won:
                            prize_won = f"Rs. {prize_amount}"
                            prize_amount_won = prize_amount
                            logging.info(f"Matched 'First {num_correct} Numbers Correct': Prize = {prize_won}")
                except (IndexError, ValueError) as e:
                    logging.error(f"Error parsing 'First X Numbers Correct' pattern '{pattern}': {e}")

            # Check for "Letter Correct" (without numbers)
            elif "Letter Correct" in pattern and "Numbers" not in pattern:
                if ticket_letter == winning_letter:
                    if prize_amount > prize_amount_won:
                        prize_won = f"Rs. {prize_amount}"
                        prize_amount_won = prize_amount
                        logging.info(f"Matched 'Letter Correct': Prize = {prize_won}")

        if not prize_won:
            prize_won = "No prize won"
            logging.info("No prize won for this ticket")

        # Format prize as "Rs 40/="
        if prize_won != "No prize won":
            prize_match = re.search(r'Rs\. (\d+)', prize_won)
            prize_won = f"Rs {prize_match.group(1)}/=" if prize_match else "No prize won"

        results.append({
            "ticket": f"{ticket_letter} {ticket_numbers}",
            "prize": prize_won
        })

    return results

def process_lottery_ticket(image_data):
    qr_code_data, qr_data_raw, pyzbar_success = decode_qr_code(image_data)
    qr_details = extract_lottery_details_from_qr(qr_code_data)

    if isinstance(qr_details, str):
        return {
            "lotteryName": "Unknown",
            "drawDate": "Unknown",
            "validation": "Invalid",
            "lotteryNumbers": "N/A",
            "lotteryResults": "Error: Could not process ticket",
            "winningPrice": "No prize won"
        }

    lottery_name = qr_details.get('lottery_name', 'Unknown')
    face_numbers = extract_face_numbers(image_data, lottery_name)

    ticket_letter = qr_details.get('letter', 'Unknown')
    ticket_numbers = qr_details.get('numbers', 'Unknown')
    draw_no = qr_details.get('draw_no', 'Unknown')
    draw_date = qr_details.get('draw_date', 'Unknown')

    try:
        draw_date_formatted = datetime.strptime(draw_date, '%d.%m.%Y').strftime('%A, %d.%m.%Y').upper()
    except ValueError:
        draw_date_formatted = "UNKNOWN"

    validation = validate_ticket(qr_details, face_numbers, pyzbar_success)
    validation_status = "Valid" if "✅ Valid" in validation else "Invalid"
    lottery_numbers = f"{ticket_letter} {ticket_numbers}"

    winning_result = "No winning data available"
    prize_results = [{"ticket": lottery_numbers, "prize": "No prize won"}]
    if "✅ Valid" in validation:
        if draw_no and draw_no != "Unknown":
            winning_result = get_winning_numbers_from_nlb(lottery_name, draw_no)
            if "Error" not in winning_result and "not found" not in winning_result:
                parts = winning_result.split()
                winning_letter = parts[0]
                winning_numbers = parts[1]
                tickets = [{"letter": ticket_letter, "numbers": ticket_numbers}]
                prize_results = determine_prize(tickets, winning_letter, winning_numbers, lottery_name)
            else:
                winning_result = winning_result
    else:
        winning_result = "Winning number check skipped due to invalid ticket"

    return {
        "lotteryName": lottery_name.upper(),
        "drawDate": draw_date_formatted,
        "validation": validation_status,
        "lotteryNumbers": lottery_numbers,
        "lotteryResults": winning_result,
        "winningPrice": prize_results[0]["prize"]
    }