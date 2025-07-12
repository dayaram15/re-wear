from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from flask_jwt_extended import JWTManager

jwt = JWTManager()
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    jwt.init_app(app)
    db.init_app(app)
    CORS(app,supports_credentials=True)

    # Ensure models are imported before db.create_all()
    from app import models

    with app.app_context():
        db.create_all()

    from app.auth import auth_bp
    app.register_blueprint(auth_bp)


    return app
