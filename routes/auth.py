import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
    get_jwt
)
from werkzeug.security import check_password_hash
from datetime import datetime, timezone
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from extensions import limiter

from models import db, User, AddressBook

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/google', methods=['POST'])
@limiter.limit("5 per minute")
def google_login():
    """
    Verify Google ID token and create/login user.
    Frontend sends the credential (ID token) received from Google Identity Services.
    
    Flow:
    1. Frontend loads Google Identity Services JS library
    2. User clicks "Sign in with Google" button
    3. Google shows account picker and returns ID token to frontend callback
    4. Frontend POSTs the ID token to this endpoint
    5. Backend verifies token with Google
    6. Backend creates/finds user and returns JWT tokens
    """
    try:
        data = request.get_json()
        credential = data.get('credential')  # ID token from Google
        
        if not credential:
            return jsonify({
                'success': False,
                'error': 'Missing credential (ID token)'
            }), 400
        
        # Verify the ID token with Google
        try:
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                current_app.config['GOOGLE_CLIENT_ID']
            )
            
            # Additional security checks
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                return jsonify({
                    'success': False,
                    'error': 'Invalid token issuer'
                }), 401
            
            if idinfo['aud'] != current_app.config['GOOGLE_CLIENT_ID']:
                return jsonify({
                    'success': False,
                    'error': 'Invalid token audience'
                }), 401
                
        except ValueError as e:
            # Invalid token
            return jsonify({
                'success': False,
                'error': f'Invalid ID token: {str(e)}'
            }), 401
        
        # Extract user info from verified token
        google_id = idinfo['sub']
        email = idinfo['email']
        email_verified = idinfo.get('email_verified', False)
        name = idinfo.get('name', email.split('@')[0])
        picture = idinfo.get('picture')
        
        # Find or create user in database
        user = User.query.filter_by(oauth_provider='google', oauth_id=google_id).first()
        
        if not user:
            # Check if user exists with same email but different OAuth provider
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                # Link Google account to existing user
                user = existing_user
                user.oauth_provider = 'google'
                user.oauth_id = google_id
                user.profile_picture = picture
                user.is_verified = email_verified
            else:
                # Create new user
                user = User(
                    email=email,
                    name=name,
                    oauth_provider='google',
                    oauth_id=google_id,
                    profile_picture=picture,
                    is_verified=email_verified
                )
                db.session.add(user)
        else:
            # Update existing Google user info
            user.name = name
            user.profile_picture = picture
            user.is_verified = email_verified
        
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        db.session.commit()
        
        # Create JWT tokens for session management
        access_token = create_access_token(
            identity=str(user.user_id),
            fresh=True,
            additional_claims={'email': user.email, 'name': user.name}
        )
        refresh_token = create_refresh_token(identity=str(user.user_id))
        
        return jsonify({
            'success': True,
            'data': {
                'tokens': {
                    'access': access_token,
                    'refresh': refresh_token
                },
                'user': {
                    'id': user.user_id,
                    'email': user.email,
                    'name': user.name,
                    'profile_picture': user.profile_picture
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Login failed: {str(e)}'
        }), 500


@auth_bp.route('/signup', methods=['POST'])
@limiter.limit("5 per minute")
def signup():
    """Register a new user with email and password"""
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    mobile_number = data.get('mobile_number')
    
    if not all([name, email, password]):
        return jsonify({'success': False, 'error': 'Name, email, and password are required'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'error': 'Email already registered'}), 400
    
    if mobile_number and User.query.filter_by(mobile_number=mobile_number).first():
        return jsonify({'success': False, 'error': 'Mobile number already registered'}), 400
    
    # Create new user
    user = User(
        name=name,
        email=email,
        mobile_number=mobile_number,
        oauth_provider='local'
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    # Create tokens
    access_token = create_access_token(
        identity=user.user_id,
        fresh=True,
        additional_claims={'email': user.email, 'name': user.name}
    )
    refresh_token = create_refresh_token(identity=user.user_id)
    
    return jsonify({
        'success': True,
        'data': {
            'tokens': {
                'access': access_token,
                'refresh': refresh_token
            },
            'user': {
                'id': user.user_id,
                'email': user.email,
                'name': user.name
            }
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """Login with email and password"""
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'error': 'Invalid email or password'}), 401
    
    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.session.commit()
    
    # Create tokens
    access_token = create_access_token(
        identity=user.user_id,
        fresh=True,
        additional_claims={'email': user.email, 'name': user.name}
    )
    refresh_token = create_refresh_token(identity=user.user_id)
    
    return jsonify({
        'success': True,
        'data': {
            'tokens': {
                'access': access_token,
                'refresh': refresh_token
            },
            'user': {
                'id': user.user_id,
                'email': user.email,
                'name': user.name,
                'profile_picture': user.profile_picture
            }
        }
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using refresh token"""
    try:
        identity = get_jwt_identity()
        user = User.query.get(identity)
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        access_token = create_access_token(
            identity=user.user_id,
            fresh=False,
            additional_claims={'email': user.email, 'name': user.name}
        )
        
        return jsonify({
            'success': True,
            'data': {
                'tokens': {
                    'access': access_token
                }
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client should delete tokens)"""
    # With JWT, logout is handled client-side by deleting the tokens
    # Optionally implement token blacklist here for added security
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    try:
        user_id = get_jwt_identity()
        print(f"DEBUG /me: Got user_id from JWT: {user_id}")
        user = User.query.get(user_id)
        
        if not user:
            print(f"DEBUG /me: User not found for id {user_id}")
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        print(f"DEBUG /me: Returning user {user.email}")
        return jsonify({
            'success': True,
            'data': {
                'user': {
                    'id': user.user_id,
                    'email': user.email,
                    'name': user.name,
                    'mobile_number': user.mobile_number,
                    'profile_picture': user.profile_picture,
                    'oauth_provider': user.oauth_provider,
                    'last_login': user.last_login.isoformat() if user.last_login else None
                }
            }
        }), 200
    except Exception as e:
        print(f"DEBUG /me: Exception - {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Alias for /me endpoint - Get current user profile"""
    try:
        user_id = int(get_jwt_identity())
        print(f"DEBUG /profile: Got user_id from JWT: {user_id}")
        user = User.query.get(user_id)
        
        if not user:
            print(f"DEBUG /profile: User not found for id {user_id}")
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        print(f"DEBUG /profile: Returning user {user.email}")
        return jsonify({
            'success': True,
            'data': {
                'user': {
                    'id': user.user_id,
                    'email': user.email,
                    'name': user.name,
                    'mobile_number': user.mobile_number,
                    'profile_picture': user.profile_picture,
                    'oauth_provider': user.oauth_provider,
                    'last_login': user.last_login.isoformat() if user.last_login else None
                }
            }
        }), 200
    except Exception as e:
        print(f"DEBUG /profile: Exception - {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
