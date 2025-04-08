from flask import Flask
from flask_cors import CORS
from config.config import Config
from sales import sales_bp
# from users import users_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes, allowing requests from localhost:3000
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    # Register blueprints
    app.register_blueprint(sales_bp, url_prefix='/sales')
    # app.register_blueprint(users_bp, url_prefix='/users')

    @app.route('/')
    def index():
        return "Welcome to LankaLotto API"

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)