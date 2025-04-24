import os
import uuid
from flask import request, jsonify
from werkzeug.utils import secure_filename
from . import lottery_validation_bp
from .lottery_validation import process_lottery_ticket, store_result, get_result

# Define the upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@lottery_validation_bp.route('/upload-image', methods=['POST'])
def upload_image():
    """
    Endpoint to upload and process a lottery ticket image.
    Expects a multipart form with an 'image' field containing the ticket image.
    Processes the ticket and stores the result in memory.
    Returns a unique image ID to be used for retrieving the result.
    """
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Only JPG, JPEG, and PNG are allowed."}), 400

        # Generate a unique filename
        filename = f"{uuid.uuid4().hex}.{file.filename.rsplit('.', 1)[1].lower()}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        # Save the file temporarily
        file.save(file_path)

        # Read the image data
        with open(file_path, 'rb') as f:
            image_data = f.read()

        # Process the ticket
        result = process_lottery_ticket(image_data)
        print(f"Processed result for image_id {filename}: {result}")

        # Store the result in memory
        store_result(filename, result)

        # Delete the temporary file
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")

        return jsonify({"image_id": filename}), 200

    except Exception as e:
        print(f"Error in upload_image: {str(e)}")
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500

@lottery_validation_bp.route('/process-ticket', methods=['POST'])
def process_ticket():
    """
    Endpoint to retrieve the pre-processed lottery ticket result.
    Expects a JSON body with an 'image_id' field.
    Returns ticket details, winning result, and prize information.
    """
    try:
        data = request.get_json()
        if not data or 'image_id' not in data:
            print("No image_id provided in request")
            return jsonify({"error": "No image_id provided"}), 400

        image_id = data['image_id']
        print(f"Processing request for image_id: {image_id}")
        result = get_result(image_id)

        if result is None:
            print(f"Result not found for image_id: {image_id}")
            return jsonify({"error": "Result not found or has expired"}), 404

        print(f"Returning result for image_id {image_id}: {result}")
        return jsonify(result), 200

    except Exception as e:
        print(f"Error in process_ticket: {str(e)}")
        return jsonify({"error": f"Error retrieving result: {str(e)}"}), 500