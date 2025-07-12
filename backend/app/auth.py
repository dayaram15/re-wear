from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
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
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "success": True,
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email
        }
    }), 200
