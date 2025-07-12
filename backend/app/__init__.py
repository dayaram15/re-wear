from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from flask_jwt_extended import JWTManager
import cloudinary
jwt = JWTManager()
db = SQLAlchemy()
    
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    jwt.init_app(app)
    db.init_app(app)
    CORS(app, 
         supports_credentials=True, 
         origins=["http://localhost:5173", "http://127.0.0.1:5173"],
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         credentials=True)


    cloudinary.config(
        cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
        api_key=app.config['CLOUDINARY_API_KEY'],
        api_secret=app.config['CLOUDINARY_API_SECRET']
    )

    # Ensure models are imported before db.create_all()
    from app import models

    with app.app_context():
        db.create_all()

    from app.routes.items import item_bp
    from app.routes.swap import swap_bp
    from app.routes.admin import admin_bp
    from app.auth import auth_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(item_bp)
    app.register_blueprint(swap_bp)
    app.register_blueprint(admin_bp)


    return app
