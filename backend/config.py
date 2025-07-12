import os
from datetime import timedelta



class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql+psycopg2://postgres:Vision@localhost:5432/re-wear')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 're-wear-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret-jwt-key') 
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24) 
    CLOUDINARY_CLOUD_NAME = os.getenv('ddlbwwyj1')
    CLOUDINARY_API_KEY = os.getenv('543898272745924')
    CLOUDINARY_API_SECRET = os.getenv('k-5ER4n-l_sLVzX1iGmfpyuWf2I')
    UPLOAD_FOLDER = 'app/static/uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_SECURE = False  # Set to True only in production (HTTPS)
    JWT_COOKIE_SAMESITE = "Lax"  # or "None" if frontend and backend are on different domains
    JWT_COOKIE_CSRF_PROTECT = False  # Set to True in production with CSRF tokens
    JWT_ACCESS_COOKIE_NAME = "access_token_cookie"