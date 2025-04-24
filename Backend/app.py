import logging
logging.getLogger('pymongo').setLevel(logging.WARNING)

from flask import Flask
from flask_cors import CORS
from config.config import Config
from sales_predictions import sales_pred_bp
from users import users_bp
from lottery_validation import lottery_validation_bp
from sales import sales_bp  # Import the sales blueprint
# from flask_jwt_extended import JWTManager
# from seed.seed_admin import seed_admin

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # jwt = JWTManager(app)
    # Enable CORS for all routes
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Seed the prize structure data into MongoDB
    with app.app_context():
        print("Seeding prize structure data into MongoDB...")
        # seed_prize()
        # seed_lottery_agents()
        # seed_admin()
        print("Prize structure seeding completed.")

    # Register blueprints
    app.register_blueprint(sales_pred_bp, url_prefix='/sales_pred')
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(lottery_validation_bp, url_prefix='/lottery')
    app.register_blueprint(sales_bp, url_prefix='/sales')

    print(app.url_map)


    @app.route('/')
    def index():
        return "Welcome to LankaLotto API"

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)