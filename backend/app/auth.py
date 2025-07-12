from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, set_access_cookies, unset_jwt_cookies, jwt_required, get_jwt_identity
from app.models import User
from app import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not all(field in data for field in ['username', 'name', 'email', 'password']):
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"success": False, "message": "Email already exists"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"success": False, "message": "Username already exists"}), 400

    profile_picture = data.get('profile_picture', None)

    new_user = User(
        username=data['username'],
        name=data['name'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'], method='pbkdf2:sha256'),
        profile_picture=profile_picture
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "User registered successfully"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    print("=== /login endpoint called ===")
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    print("Created access token:", access_token[:20] + "...")
    
    # Set cookie in response
    response = jsonify({
        "success": True,
        "message": "Login successful",
        "token": access_token,  # Include token in response for localStorage
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "is_admin": user.is_admin,
            "points_balance": user.points_balance
        }
    })
    
    # Manually set the cookie with explicit settings
    response.set_cookie(
        'access_token_cookie',
        access_token,
        max_age=24*60*60,  # 24 hours
        domain=None,  # Don't set domain for localhost
        path='/',
        secure=False,
        httponly=True,
        samesite='None'  # Allow cross-origin requests
    )
    
    print("Response headers after setting cookies:", dict(response.headers))
    print("Response cookies:", response.headers.getlist('Set-Cookie'))
    
    return response, 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"success": True, "message": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    print("=== /me endpoint called ===")
    print("Request cookies:", request.cookies)
    user_id = int(get_jwt_identity())
    print("User ID from JWT:", user_id)
    user = User.query.get(user_id)
    print("User found:", user is not None)
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "is_admin": user.is_admin,
            "points_balance": user.points_balance,
            "profile_picture": user.profile_picture
        }
    }), 200


@auth_bp.route('/test', methods=['GET'])
@jwt_required()
def test_auth():
    """Test endpoint to verify JWT authentication is working"""
    print("=== /test endpoint called ===")
    print("Request cookies:", request.cookies)
    print("JWT cookie value:", request.cookies.get('access_token_cookie'))
    
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    print("User ID from JWT:", user_id)
    print("User found:", user is not None)
    
    return jsonify({
        "success": True,
        "message": "Authentication working",
        "user_id": user_id,
        "username": user.username if user else None
    }), 200


@auth_bp.route('/debug-cookies', methods=['GET'])
def debug_cookies():
    """Debug endpoint to check what cookies are being sent"""
    print("=== /debug-cookies endpoint called ===")
    print("All request cookies:", dict(request.cookies))
    print("JWT cookie:", request.cookies.get('access_token_cookie'))
    print("Request headers:", dict(request.headers))
    print("Origin:", request.headers.get('Origin'))
    print("Referer:", request.headers.get('Referer'))
    
    return jsonify({
        "success": True,
        "cookies": dict(request.cookies),
        "headers": dict(request.headers),
        "origin": request.headers.get('Origin'),
        "referer": request.headers.get('Referer')
    }), 200