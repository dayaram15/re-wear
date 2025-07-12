import os
from datetime import timedelta



class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql+psycopg2://postgres:Vision@localhost:5432/re-wear')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 're-wear-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret-jwt-key') 
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24) 
    JWT_TOKEN_LOCATION = ['cookies']
    CLOUDINARY_CLOUD_NAME = 'ddlbwwyj1'
    CLOUDINARY_API_KEY = '543898272745924'
    CLOUDINARY_API_SECRET = 'k-5ER4n-l_sLVzX1iGmfpyuWf2I'
    UPLOAD_FOLDER = 'app/static/uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    JWT_ACCESS_COOKIE_PATH = '/'
    JWT_COOKIE_SECURE = False        # Set to True in production (HTTPS)
    JWT_COOKIE_CSRF_PROTECT = False 
    JWT_COOKIE_SAMESITE = "Strict"
