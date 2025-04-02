# app.py
from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import random
import string
from twilio.rest import Client
from bson import ObjectId
from config import Config
from seed import seed_admin, seed_lottery_agents

app = Flask(__name__)
app.secret_key = Config.SECRET_KEY
app.permanent_session_lifetime = timedelta(hours=2)

# MongoDB connection
client = MongoClient(Config.MONGO_URI)
db = client.get_database()
users_collection = db['users']
lottery_agents_collection = db['lottery_agents']
agent_requests_collection = db['agent_requests']

# Twilio configuration
twilio_client = Client(Config.TWILIO_SID, Config.TWILIO_AUTH_TOKEN)
TWILIO_PHONE = Config.TWILIO_PHONE

# Seed data on startup
seed_admin()
seed_lottery_agents()

# Agent Registration
@app.route('/api/agent/register', methods=['POST'])
def agent_register():
    data = request.json
    required_fields = ['agent_name', 'nlb_no', 'dlb_no', 'mobile_no', 'address', 'password']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    # Check if agent already exists
    if users_collection.find_one({'mobile_no': data['mobile_no']}):
        return jsonify({'error': 'Mobile number already registered'}), 400

    agent_request = {
        'agent_name': data['agent_name'],
        'nlb_no': data['nlb_no'],
        'dlb_no': data['dlb_no'],
        'mobile_no': data['mobile_no'],
        'address': data['address'],
        'password': generate_password_hash(data['password']),
        'status': 'pending'
    }
    
    agent_requests_collection.insert_one(agent_request)
    return jsonify({'message': 'Registration request submitted for approval'}), 201

# Admin approve agent
@app.route('/api/admin/approve_agent/<request_id>', methods=['POST'])
def approve_agent(request_id):
    if 'role' not in session or session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401

    agent_request = agent_requests_collection.find_one({'_id': ObjectId(request_id)})
    if not agent_request:
        return jsonify({'error': 'Request not found'}), 404

    # Verify against lottery board data
    is_valid = lottery_agents_collection.find_one({
        '$or': [
            {'nlb_no': agent_request['nlb_no']},
            {'dlb_no': agent_request['dlb_no']}
        ]
    })

    if is_valid:
        user_data = {
            'agent_name': agent_request['agent_name'],
            'mobile_no': agent_request['mobile_no'],
            'address': agent_request['address'],
            'password': agent_request['password'],
            'role': 'agent',
            'nlb_no': agent_request['nlb_no'],
            'dlb_no': agent_request['dlb_no']
        }
        
        users_collection.insert_one(user_data)
        agent_requests_collection.delete_one({'_id': ObjectId(request_id)})
        
        # Send SMS notification
        twilio_client.messages.create(
            body='Your agent registration has been approved. You can now login.',
            from_=TWILIO_PHONE,
            to=agent_request['mobile_no']
        )
        
        return jsonify({'message': 'Agent approved'}), 200
    return jsonify({'error': 'Invalid agent credentials'}), 400

# Login with OTP
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = users_collection.find_one({'mobile_no': data['mobile_no']})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    otp = ''.join(random.choices(string.digits, k=6))
    session['otp'] = otp
    session['mobile_no'] = data['mobile_no']
    session.permanent = True
    
    # Send OTP
    twilio_client.messages.create(
        body=f'Your OTP is: {otp}',
        from_=TWILIO_PHONE,
        to=data['mobile_no']
    )
    
    return jsonify({'message': 'OTP sent'}), 200

# Verify OTP
@app.route('/api/verify_otp', methods=['POST'])
def verify_otp():
    data = request.json
    if 'otp' in session and session['otp'] == data['otp']:
        user = users_collection.find_one({'mobile_no': session['mobile_no']})
        session['user_id'] = str(user['_id'])
        session['role'] = user['role']
        session.pop('otp')
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'error': 'Invalid OTP'}), 400

# User Profile
@app.route('/api/profile', methods=['GET', 'PUT', 'DELETE'])
def profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = ObjectId(session['user_id'])
    
    if request.method == 'GET':
        user = users_collection.find_one({'_id': user_id}, {'password': 0})
        return jsonify(user), 200
    
    elif request.method == 'PUT':
        data = request.json
        users_collection.update_one(
            {'_id': user_id},
            {'$set': {
                'agent_name': data.get('agent_name'),
                'mobile_no': data.get('mobile_no'),
                'address': data.get('address')
            }}
        )
        return jsonify({'message': 'Profile updated'}), 200
    
    elif request.method == 'DELETE':
        users_collection.delete_one({'_id': user_id})
        session.clear()
        return jsonify({'message': 'Account deleted'}), 200

# Logout
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'}), 200

# Admin get pending requests
@app.route('/api/admin/pending_requests', methods=['GET'])
def get_pending_requests():
    if 'role' not in session or session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    requests = list(agent_requests_collection.find())
    for req in requests:
        req['_id'] = str(req['_id'])
    return jsonify(requests), 200

if __name__ == '__main__':
    app.run(debug=True)