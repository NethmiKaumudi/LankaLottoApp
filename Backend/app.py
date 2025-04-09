from flask import Flask
from flask_cors import CORS
from config.config import Config
from sales import sales_bp
# from users import users_bp
from lottery_validation import lottery_validation_bp
from seed.seed_prize import seed_prize  # Import the seed_prize function

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes, allowing requests from any origin (for development)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Seed the prize structure data into MongoDB before starting the server
    with app.app_context():
        print("Seeding prize structure data into MongoDB...")
        seed_prize()
        print("Prize structure seeding completed.")

    # Register blueprints
    app.register_blueprint(sales_bp, url_prefix='/sales')
    # app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(lottery_validation_bp, url_prefix='/lottery')

    @app.route('/')
    def index():
        return "Welcome to LankaLotto API"

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)