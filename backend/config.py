import os
from datetime import timedelta



class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///re-wear.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 're-wear-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret-jwt-key') 
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24) 
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', 'ddlbwwyj1')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '543898272745924')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', 'k-5ER4n-l_sLVzX1iGmfpyuWf2I')
    UPLOAD_FOLDER = 'app/static/uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    JWT_TOKEN_LOCATION = ["cookies", "headers"]
    JWT_COOKIE_SECURE = False  # Set to True only in production (HTTPS)
    JWT_COOKIE_SAMESITE = "Lax"  # Use Lax for localhost development
    JWT_COOKIE_CSRF_PROTECT = False  # Set to True in production with CSRF tokens
    JWT_ACCESS_COOKIE_NAME = "access_token_cookie"
    JWT_COOKIE_DOMAIN = None  # Don't set domain for localhost
    JWT_COOKIE_PATH = "/"
    JWT_COOKIE_HTTPONLY = True
    JWT_COOKIE_REFRESH_CSRF_PROTECT = False
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"