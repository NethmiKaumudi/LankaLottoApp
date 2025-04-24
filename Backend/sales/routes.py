import logging
from flask import Blueprint, request, jsonify
from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId
from config.config import Config
from math import isnan
import jwt  # Add JWT for token validation

logging.getLogger('pymongo').setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

sales_bp = Blueprint('sales', __name__, url_prefix='/sales')
try:
    mongo = MongoClient(Config.MONGO_URI)
    db = mongo.get_database()
    agents_collection = db['Agents']  # Updated to use Agents collection
    sales_collection = db['sales']
    admins_collection = db['admins']  # Admins collection for admin users

    logger.info("MongoDB connection and indexes created successfully")
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {str(e)}")
    raise
def admin_required(f):
    def wrapper(*args, **kwargs):
        try:
            token = request.headers.get('Authorization', '').split('Bearer ')[-1]
            decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            if decoded.get('role') != 'admin':
                return jsonify({'message': 'Unauthorized: Admin access required.'}), 403
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token.'}), 401
        except IndexError:
            return jsonify({'message': 'Authorization header missing or invalid.'}), 401
    wrapper.__name__ = f.__name__  # Preserve function name for Flask
    return wrapper

@sales_bp.route('/save', methods=['POST'])
def add_sales():
    try:
        data = request.get_json()
        logger.info(f"Received payload: {data}")

        required_fields = ['agent_id', 'date_of_sale', 'province', 'district', 'area', 'dlb_sale', 'nlb_sale', 'total_sale']
        if not data or not all(field in data and data[field] is not None for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400

        for field in ['province', 'district', 'area']:
            if not data[field].strip():
                return jsonify({'message': f'{field.capitalize()} cannot be empty'}), 422

        agent_id = data.get('agent_id')
        try:
            agent = agents_collection.find_one({'_id': ObjectId(agent_id), 'Status': True})
            if not agent:
                return jsonify({'message': 'Agent not found or not approved'}), 404
        except Exception:
            return jsonify({'message': 'Invalid agent_id format'}), 400

        date_of_sale = data.get('date_of_sale')
        try:
            datetime.strptime(date_of_sale, '%Y-%m-%d')
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

        try:
            dlb_sale = float(data.get('dlb_sale'))
            nlb_sale = float(data.get('nlb_sale'))
            total_sale = float(data.get('total_sale'))
            if isnan(dlb_sale) or isnan(nlb_sale) or isnan(total_sale):
                return jsonify({'message': 'DLB Sale, NLB Sale, and Total Sale must be valid numbers'}), 422
            if dlb_sale < 0 or nlb_sale < 0 or total_sale < 0:
                return jsonify({'message': 'DLB Sale, NLB Sale, and Total Sale must be non-negative'}), 422
            if total_sale != dlb_sale + nlb_sale:
                return jsonify({'message': 'Total Sale must equal DLB Sale + NLB Sale'}), 422
        except (ValueError, TypeError):
            return jsonify({'message': 'DLB Sale, NLB Sale, and Total Sale must be valid numbers'}), 422

        # Check for existing sales entry for the same agent and date
        existing_entry = sales_collection.find_one({
            'agent_id': agent_id,
            'date_of_sale': date_of_sale
        })
        if existing_entry:
            return jsonify({'message': 'Sales data for this agent on the selected date already exists'}), 409

        # Get agent details for name and agent_no
        agent_name = agent.get('Agent_Name', 'Unknown')
        agent_no = agent.get('NLB_DLB_No', 'Unknown')

        sales_entry = {
            'agent_id': agent_id,
            'agent_name': agent_name,
            'agent_no': agent_no,
            'date_of_sale': date_of_sale,
            'province': data.get('province').strip(),
            'district': data.get('district').strip(),
            'area': data.get('area').strip(),
            'dlb_sale': dlb_sale,
            'nlb_sale': nlb_sale,
            'total_sale': total_sale,
            'status': 'active',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        result = sales_collection.insert_one(sales_entry)
        logger.info(f"Sales data saved with ID: {result.inserted_id}")

        return jsonify({
            'message': 'Sales data saved successfully',
            'sales_id': str(result.inserted_id)
        }), 201

    except Exception as e:
        logger.error(f"Error saving sales data: {str(e)}")
        return jsonify({'message': f'Error saving sales data: {str(e)}'}), 500


@sales_bp.route('/<sales_id>', methods=['PUT'])
def update_sale(sales_id):
    try:
        data = request.get_json()
        logger.info(f"Received update payload: {data}")

        required_fields = ['agent_id', 'date_of_sale', 'province', 'district', 'area', 'dlb_sale', 'nlb_sale', 'total_sale']
        if not data or not all(field in data and data[field] is not None for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400

        for field in ['province', 'district', 'area']:
            if not data[field].strip():
                return jsonify({'message': f'{field.capitalize()} cannot be empty'}), 422

        agent_id = data.get('agent_id')
        try:
            agent = agents_collection.find_one({'_id': ObjectId(agent_id), 'Status': True})
            if not agent:
                return jsonify({'message': 'Agent not found or not approved'}), 404
        except Exception:
            return jsonify({'message': 'Invalid agent_id format'}), 400

        date_of_sale = data.get('date_of_sale')
        try:
            datetime.strptime(date_of_sale, '%Y-%m-%d')
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

        try:
            dlb_sale = float(data.get('dlb_sale'))
            nlb_sale = float(data.get('nlb_sale'))
            total_sale = float(data.get('total_sale'))
            if isnan(dlb_sale) or isnan(nlb_sale) or isnan(total_sale):
                return jsonify({'message': 'DLB Sale, NLB Sale, and Total Sale must be valid numbers'}), 422
            if dlb_sale < 0 or nlb_sale < 0 or total_sale < 0:
                return jsonify({'message': 'DLB Sale, NLB Sale, and Total Sale must be non-negative'}), 422
            if total_sale != dlb_sale + nlb_sale:
                return jsonify({'message': 'Total Sale must equal DLB Sale + NLB Sale'}), 422
        except (ValueError, TypeError):
            return jsonify({'message': 'DLB Sale, NLB Sale, and Total Sale must be valid numbers'}), 422

        # Get agent details for name and agent_no
        agent_name = agent.get('Agent_Name', 'Unknown')
        agent_no = agent.get('NLB_DLB_No', 'Unknown')

        result = sales_collection.update_one(
            {'_id': ObjectId(sales_id), 'agent_id': agent_id},
            {
                '$set': {
                    'agent_name': agent_name,  # Update agent_name
                    'agent_no': agent_no,      # Update agent_no
                    'date_of_sale': date_of_sale,
                    'province': data.get('province').strip(),
                    'district': data.get('district').strip(),
                    'area': data.get('area').strip(),
                    'dlb_sale': dlb_sale,
                    'nlb_sale': nlb_sale,
                    'total_sale': total_sale,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({'message': 'Sales entry not found or agent_id does not match'}), 404

        logger.info(f"Updated sales entry {sales_id}")
        return jsonify({'message': 'Sales data updated successfully'}), 200

    except Exception as e:
        logger.error(f"Error updating sales data: {str(e)}")
        return jsonify({'message': f'Error updating sales data: {str(e)}'}), 500

@sales_bp.route('/agent', methods=['GET'])
def get_sales_by_agent():
    try:
        agent_id = request.args.get('agent_id')
        if not agent_id:
            return jsonify({'message': 'agent_id query parameter is required'}), 400

        try:
            ObjectId(agent_id)
        except Exception:
            return jsonify({'message': 'Invalid agent_id format'}), 400

        sales_data = list(sales_collection.find({'agent_id': agent_id}))

        for sale in sales_data:
            sale['_id'] = str(sale['_id'])
            sale['created_at'] = sale['created_at'].isoformat()
            sale['updated_at'] = sale['updated_at'].isoformat()
            # agent_name and agent_no are already stored in the sales collection

        logger.info(f"Fetched {len(sales_data)} sales records for agent {agent_id}")
        return jsonify(sales_data), 200

    except Exception as e:
        logger.error(f"Error fetching sales data: {str(e)}")
        return jsonify({'message': f'Error fetching sales data: {str(e)}'}), 500

@sales_bp.route('/<sales_id>', methods=['DELETE'])
def delete_sale(sales_id):
    try:
        agent_id = request.args.get('agent_id')
        if not agent_id:
            return jsonify({'message': 'agent_id query parameter is required'}), 400

        try:
            ObjectId(agent_id)
        except Exception:
            return jsonify({'message': 'Invalid agent_id format'}), 400

        result = sales_collection.delete_one({'_id': ObjectId(sales_id), 'agent_id': agent_id})

        if result.deleted_count == 0:
            return jsonify({'message': 'Sales entry not found or agent_id does not match'}), 404

        logger.info(f"Deleted sales entry {sales_id}")
        return jsonify({'message': 'Sales data deleted successfully'}), 200

    except Exception as e:
        logger.error(f"Error deleting sales data: {str(e)}")
        return jsonify({'message': f'Error deleting sales data: {str(e)}'}), 500

@sales_bp.route('/all', methods=['GET'])
@admin_required  # Restrict to authenticated admins
def get_all_sales():
    try:
        sales_data = list(sales_collection.find())

        for sale in sales_data:
            sale['_id'] = str(sale['_id'])
            sale['created_at'] = sale['created_at'].isoformat()
            sale['updated_at'] = sale['updated_at'].isoformat()
            # agent_name and agent_no are already stored in the sales collection

        logger.info(f"Fetched {len(sales_data)} sales records for admin dashboard")
        return jsonify(sales_data), 200

    except Exception as e:
        logger.error(f"Error fetching all sales data: {str(e)}")
        return jsonify({'message': f'Error fetching all sales data: {str(e)}'}), 500


@sales_bp.route('/by-date', methods=['GET'])
@admin_required  
def get_sales_by_date():
    try:
        pipeline = [
            {
                '$group': {
                    '_id': '$date_of_sale',
                    'total_sale': {'$sum': '$total_sale'},
                    'dlb_sale': {'$sum': '$dlb_sale'},
                    'nlb_sale': {'$sum': '$nlb_sale'}
                }
            },
            {'$sort': {'_id': 1}}
        ]
        sales_data = list(sales_collection.aggregate(pipeline))
        logger.info(f"Fetched aggregated sales data by date")

        return jsonify(sales_data), 200

    except Exception as e:
        logger.error(f"Error fetching sales data by date: {str(e)}")
        return jsonify({'message': f'Error fetching sales data by date: {str(e)}'}), 500
    
@sales_bp.route('/by-date-agent', methods=['GET'])
def get_sales_by_date_agent():
    try:
        agent_id = request.args.get('agent_id')
        if not agent_id:
            return jsonify({'message': 'agent_id query parameter is required'}), 400

        try:
            ObjectId(agent_id)
        except Exception:
            return jsonify({'message': 'Invalid agent_id format'}), 400

        # Check if the agent exists and is approved
        agent = agents_collection.find_one({'_id': ObjectId(agent_id), 'Status': True})
        if not agent:
            return jsonify({'message': 'Agent not found or not approved'}), 404

        pipeline = [
            {
                '$match': {
                    'agent_id': agent_id,
                    'status': 'active'
                }
            },
            {
                '$group': {
                    '_id': '$date_of_sale',
                    'total_sale': {'$sum': '$total_sale'},
                    'dlb_sale': {'$sum': '$dlb_sale'},
                    'nlb_sale': {'$sum': '$nlb_sale'}
                }
            },
            {'$sort': {'_id': 1}}
        ]
        sales_data = list(sales_collection.aggregate(pipeline))  # Use aggregate instead of find
        logger.info(f"Fetched aggregated sales data by date for agent {agent_id}")

        return jsonify(sales_data), 200

    except Exception as e:
        logger.error(f"Error fetching sales data by date for agent: {str(e)}")
        return jsonify({'message': f'Error fetching sales data by date: {str(e)}'}), 500