import os

# Load environment variables from .env file BEFORE importing config
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, session, request
from flask_cors import CORS
from models import db, User, Product, Cart, Wishlist
from config import Config
from extensions import limiter, jwt

app = Flask(__name__)
app.config.from_object(Config)

# Configure session cookies for cross-site OAuth redirects (localhost dev only).
# In production, use HTTPS and proper domain/SameSite settings.
app.config.update(
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=False,  # Allow http://localhost for dev
    SESSION_COOKIE_HTTPONLY=True,
)

# Debug: Print loaded config values
print(f"DEBUG: GOOGLE_CLIENT_ID = {app.config.get('GOOGLE_CLIENT_ID')}")
print(f"DEBUG: GOOGLE_CLIENT_SECRET = {app.config.get('GOOGLE_CLIENT_SECRET')}")
print(f"DEBUG: JWT_SECRET_KEY = {app.config.get('JWT_SECRET_KEY')}")
print(f"DEBUG: SECRET_KEY = {app.config.get('SECRET_KEY')}")

# Enable CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],  # Next.js frontend
        "supports_credentials": True  # Required for session cookies
    }
})

# Initialize extensions with app
db.init_app(app)
jwt.init_app(app)
limiter.init_app(app)

# Import token blocklist
from utils.token_blocklist import is_token_blocked

@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return is_token_blocked(jti)

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'success': False,
        'message': 'The token has expired',
        'error': 'token_expired'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"DEBUG JWT invalid_token_loader: {error}")
    return jsonify({
        'success': False,
        'message': 'Signature verification failed',
        'error': 'invalid_token'
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"DEBUG JWT unauthorized_loader: {error}")
    return jsonify({
        'success': False,
        'message': 'Request does not contain an access token',
        'error': 'authorization_required'
    }), 401

@jwt.needs_fresh_token_loader
def token_not_fresh_callback(jwt_header, jwt_payload):
    return jsonify({
        'success': False,
        'message': 'The token is not fresh',
        'error': 'fresh_token_required'
    }), 401

# Import routes
from routes.main import main_bp
from routes.auth import auth_bp
from routes.products import products_bp
from routes.cart import cart_bp
from routes.orders import orders_bp
from routes.admin import admin_bp

# Register Blueprints
app.register_blueprint(main_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(cart_bp, url_prefix='/api/cart')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

def create_tables():
    try:
        with app.app_context():
            # Test the database connection
            db.engine.connect()
            # Create tables
            db.create_all()
            print("Database connection successful and tables created.")
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise

if __name__ == '__main__':
    create_tables()
    app.run(debug=True)
