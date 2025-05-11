#users/routes
from flask import request, jsonify
from pymongo import MongoClient
from werkzeug.security import check_password_hash
from config.config import Config
import jwt
import datetime
import random
import bcrypt  # For password hashing
import requests  # For making HTTP requests to TextBee
from bson.objectid import ObjectId
from . import users_bp

# MongoDB connection
client = MongoClient(Config.MONGO_URI)
db = client.get_database()
lottery_agents_collection = db['Lottery_Agents']  # All agents in the lottery board (for validation)
agents_collection = db['Agents']  # Agents collection (pending and approved)
admins_collection = db['admins']  # Admins collection for admin users

# TextBee configuration (replace with your actual API key and device ID)
TEXTBEE_API_KEY = "b9a835c9-74e9-4f5b-b8d1-4ac680ddd2d9"  # Get this from your TextBee dashboard
TEXTBEE_DEVICE_ID = "68080eb20f2848cf7827f9c7"  # Get this from your TextBee dashboard or app
TEXTBEE_BASE_URL = "https://api.textbee.dev/api/v1"

@users_bp.route('/register', methods=['POST'])
def register():
    print("Received request to /users/register")
    data = request.get_json()
    print(f"Request data: {data}")
    
    # Extract data from the request
    agent_name = data.get('agent_name')
    nlb_dlb_no = data.get('nlb_dlb_no')
    contact_no = data.get('contact_no')
    address = data.get('address')
    password = data.get('password')
    
    # Validate required fields (all fields are required)
    if not all([agent_name, nlb_dlb_no, contact_no, address, password]):
        return jsonify({'message': 'Missing required fields. All fields are required.'}), 400

    # Check if NLB/DLB number or contact number already exists in the Agents collection
    if agents_collection.find_one({'NLB_DLB_No': nlb_dlb_no}):
        return jsonify({'message': 'NLB or DLB number already registered.'}), 400
    if agents_collection.find_one({'Contact_No': contact_no}):
        return jsonify({'message': 'Contact number already registered.'}), 400

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Save the agent in the Agents collection with status False (pending approval)
    agents_collection.insert_one({
        'Agent_Name': agent_name,
        'NLB_DLB_No': nlb_dlb_no,
        'Contact_No': contact_no,
        'Address': address,
        'Password': hashed_password,  # Store hashed password
        'Status': False  # Pending approval
    })

    return jsonify({'message': 'Registration successful. Awaiting admin approval.'}), 201

@users_bp.route('/request-otp', methods=['POST'])
def request_otp():
    print("Inside request_otp function")
    data = request.get_json()
    contact_no = data.get('contact_no')

    # Validate contact number format
    if not contact_no.startswith('+'):
        return jsonify({'message': 'Contact number must include country code (e.g., +94).'}), 400

    # Check only in Agents collection (approved agents can request OTP)
    agent = agents_collection.find_one({'Contact_No': contact_no, 'Status': True})
    if not agent:
        return jsonify({'message': 'Agent not found or not approved.'}), 404

    # Generate a 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # Store OTP in the database with an expiration (5 minutes)
    agents_collection.update_one(
        {'Contact_No': contact_no},
        {
            '$set': {
                'otp': otp,
                'otp_expiry': datetime.datetime.utcnow() + datetime.timedelta(minutes=5)  # 5 minutes expiry
            }
        }
    )

    # Send OTP via TextBee
    try:
        response = requests.post(
            f"{TEXTBEE_BASE_URL}/gateway/devices/{TEXTBEE_DEVICE_ID}/send-sms",
            json={
                "recipients": [contact_no],
                "message": f'Your LankaLotto OTP is: {otp}. It expires in 5 minutes.'
            },
            headers={"x-api-key": TEXTBEE_API_KEY}
        )
        print("TextBee Response:", response.json())  # Log the response for debugging
        if response.status_code in [200, 201]:  # Accept both 200 and 201 as success
            return jsonify({'message': 'OTP sent to your mobile number.'}), 200
        else:
            return jsonify({'message': f'Failed to send OTP: {response.text}'}), 500
    except Exception as e:
        return jsonify({'message': f'Failed to send OTP: {str(e)}'}), 500

@users_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    contact_no = data.get('contact_no')
    otp = data.get('otp')

    agent = agents_collection.find_one({'Contact_No': contact_no})
    if not agent:
        return jsonify({'message': 'Agent not found.'}), 404

    if 'otp' not in agent or 'otp_expiry' not in agent:
        return jsonify({'message': 'No OTP found. Request a new OTP.'}), 400

    if agent['otp'] != otp:
        return jsonify({'message': 'Invalid OTP.'}), 400

    if datetime.datetime.utcnow() > agent['otp_expiry']:
        return jsonify({'message': 'OTP has expired. Request a new OTP.'}), 400

    # OTP is valid, clear it from the database
    agents_collection.update_one(
        {'Contact_No': contact_no},
        {'$unset': {'otp': '', 'otp_expiry': ''}}
    )

    # Generate JWT token for agent
    token = jwt.encode({
        'contact_no': contact_no,
        'role': 'agent',  # Include role to differentiate from admin
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, Config.JWT_SECRET, algorithm='HS256')

    return jsonify({'message': 'Login successful.', 'token': token}), 200

@users_bp.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not all([username, password]):
        return jsonify({'message': 'Username and password are required.'}), 400

    admin = admins_collection.find_one({'username': username})
    if not admin:
        return jsonify({'message': 'Invalid username or password.'}), 401

    # Verify password using werkzeug
    if not check_password_hash(admin['password'], password):
        return jsonify({'message': 'Invalid username or password.'}), 401

    token = jwt.encode({
        'username': username,
        'role': 'admin',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, Config.JWT_SECRET, algorithm='HS256')

    return jsonify({'message': 'Admin login successful.', 'token': token}), 200

@users_bp.route('/pending-agents', methods=['GET'])
def get_pending_agents():
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        if decoded.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized: Admin access required.'}), 403
        agents = list(agents_collection.find({'Status': False}))
        for agent in agents:
            agent['id'] = str(agent['_id'])
            agent['agent_name'] = agent.get('Agent_Name', '')
            agent['contact_no'] = agent.get('Contact_No', '')
            agent['address'] = agent.get('Address', '')
            agent['nlb_dlb_no'] = agent.get('NLB_DLB_No', '')
            del agent['_id']
            del agent['Password']  # Remove sensitive info
            del agent['Status']    # Not shown in table as per your requirement
        return jsonify(agents), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired.'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token.'}), 401
    except IndexError:
        return jsonify({'message': 'Authorization header missing or invalid.'}), 401

@users_bp.route('/approve-agent/<agent_id>', methods=['PUT'])
def approve_agent(agent_id):
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        if decoded.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized: Admin access required.'}), 403
        agent = agents_collection.find_one({'_id': ObjectId(agent_id)})
        if not agent:
            return jsonify({'message': 'Agent not found.'}), 404

        # Update the agent's status
        agents_collection.update_one(
            {'_id': ObjectId(agent_id)},
            {'$set': {
                'Status': True,
            }}
        )

        # Send approval message via TextBee
        try:
            response = requests.post(
                f"{TEXTBEE_BASE_URL}/gateway/devices/{TEXTBEE_DEVICE_ID}/send-sms",
                json={
                    "recipients": [agent['Contact_No']],
                    "message": "Your LankaLotto account has been approved. You can now log in using your contact number and OTP."
                },
                headers={"x-api-key": TEXTBEE_API_KEY}
            )
            print("TextBee Response:", response.json())  # Log the response for debugging
            if response.status_code == 200:
                return jsonify({'message': 'Agent approved successfully.'}), 200
            else:
                return jsonify({
                    'message': 'Agent approved, but failed to send SMS.',
                    'error': response.text,
                    'phone_number': agent['Contact_No']
                }), 202
        except Exception as e:
            return jsonify({
                'message': 'Agent approved, but failed to send SMS.',
                'error': str(e),
                'phone_number': agent['Contact_No']
            }), 202
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired.'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token.'}), 401
    except IndexError:
        return jsonify({'message': 'Authorization header missing or invalid.'}), 401

@users_bp.route('/approved-agents', methods=['GET'])
def get_approved_agents():
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        if decoded.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized: Admin access required.'}), 403

        agents = list(agents_collection.find({'Status': True}))  # Fix: Use 'Status'
        for agent in agents:
            agent['id'] = str(agent['_id'])
            agent['agent_name'] = agent.get('Agent_Name', 'Unknown')  # Match frontend expectation
            agent['contact_no'] = agent.get('Contact_No', 'Unknown')
            agent['address'] = agent.get('Address', 'Unknown')
            agent['status'] = 'Active' if agent.get('Status') else 'Inactive'  # Add status field
            agent.pop('_id')
            agent.pop('Password', None)  # Remove sensitive info
            agent.pop('Status', None)  # Remove redundant field
            agent.pop('NLB_DLB_No', None)  # Remove if not needed
        return jsonify(agents), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired.'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token.'}), 401
    except IndexError:
        return jsonify({'message': 'Authorization header missing or invalid.'}), 401

@users_bp.route('/profile', methods=['GET'])
def get_profile():
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    try:
        data = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        if data.get('role') != 'agent':
            return jsonify({'message': 'Unauthorized: Agent access required.'}), 403
        agent = agents_collection.find_one({'Contact_No': data['contact_no']})
        if not agent:
            return jsonify({'message': 'Agent not found.'}), 404
        return jsonify({
            'Agent_Name': agent['Agent_Name'],  # Use uppercase key
            'NLB_DLB_No': agent['NLB_DLB_No'],  # Use uppercase key
            'Contact_No': agent['Contact_No'],  # Use uppercase key
            'Address': agent['Address'],        # Use uppercase key
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired.'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token.'}), 401
    except IndexError:
        return jsonify({'message': 'Authorization header missing or invalid.'}), 401
    
@users_bp.route('/profile', methods=['PUT'])
def update_profile():
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    try:
        data = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        if data.get('role') != 'agent':
            return jsonify({'message': 'Unauthorized: Agent access required.'}), 403
        agent = agents_collection.find_one({'Contact_No': data['contact_no']})
        if not agent:
            return jsonify({'message': 'Agent not found.'}), 404

        update_data = request.get_json()
        new_password = update_data.get('password')
        new_address = update_data.get('address')

        update_fields = {}
        if new_password:
            update_fields['Password'] = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        if new_address:
            update_fields['Address'] = new_address

        if not update_fields:
            return jsonify({'message': 'No updates provided.'}), 400

        agents_collection.update_one(
            {'Contact_No': data['contact_no']},
            {'$set': update_fields}
        )

        return jsonify({'message': 'Profile updated successfully.'}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired.'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token.'}), 401
    except IndexError:
        return jsonify({'message': 'Authorization header missing or invalid.'}), 401

@users_bp.route('/agent-stats', methods=['GET'])
def get_agent_stats():
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        if decoded.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized: Admin access required.'}), 403

        approved_count = agents_collection.count_documents({'Status': True})
        pending_count = agents_collection.count_documents({'Status': False})
        total_count = approved_count + pending_count

        return jsonify({
            'agentsCount': total_count,
            'approvedAgentsCount': approved_count,
            'pendingAgentsCount': pending_count
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired.'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token.'}), 401
    except IndexError:
        return jsonify({'message': 'Authorization header missing or invalid.'}), 401
    
@users_bp.route('/me', methods=['GET'])
def get_user_details():
    try:
        # Get contact_no from query parameters
        contact_no = request.args.get('contact_no')
        if not contact_no:
            return jsonify({'message': 'contact_no query parameter is required.'}), 400

        # Fetch agent from Agents collection using contact_no
        agent = agents_collection.find_one({'Contact_No': contact_no, 'Status': True})
        if not agent:
            return jsonify({'message': 'Agent not found or not approved.'}), 404

        # Prepare response with required fields
        user_details = {
            'agent_id': str(agent['_id']),           # MongoDB _id as agent_id
            'name': agent.get('Agent_Name', 'Unknown'),  # Agent's name
            'nlb_no': agent.get('NLB_DLB_No', None),     # NLB/DLB number (used as nlb_no)
            'dlb_no': agent.get('NLB_DLB_No', None)      # Same as nlb_no since there's no separate field
        }

        return jsonify(user_details), 200

    except Exception as e:
        return jsonify({'message': f'Error fetching user details: {str(e)}'}), 500