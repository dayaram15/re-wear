from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from app import db
from app.models import Item, ItemImage, User
from config import Config
from datetime import datetime
import cloudinary.uploader

item_bp = Blueprint('items', __name__, url_prefix='/api/items')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@item_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_item():
    user_id = int(get_jwt_identity())

    # Collect form data
    name = request.form.get('name')
    description = request.form.get('description', '')
    category = request.form.get('category')
    size = request.form.get('size', '')
    tags = request.form.get('tags', '')
    condition = request.form.get('condition', 'Good')
    type_ = request.form.get('type', 'General')

    # Validate required fields
    missing_fields = []
    if not name:
        missing_fields.append('name')
    if not category:
        missing_fields.append('category')

    if missing_fields:
        return jsonify({
            "success": False,
            "message": "Missing required fields",
            "missing_fields": missing_fields
        }), 400

    # Upload main image to Cloudinary
    main_image_file = request.files.get('mainImage')
    if not main_image_file or not allowed_file(main_image_file.filename):
        return jsonify({
            "success": False,
            "message": "Main image is required and must be valid"
        }), 400

    try:
        main_uploaded = cloudinary.uploader.upload(main_image_file)
        main_image_url = main_uploaded.get('secure_url')
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to upload main image to Cloudinary",
            "error": str(e)
        }), 500

    # === Save item only after successful main image upload ===
    item = Item(
        title=name,
        category=category,
        type=type_,
        condition=condition,
        description=description,
        tags=tags,
        size=size,
        uploader_id=user_id,
        created_at=datetime.utcnow()
    )
    db.session.add(item)
    db.session.commit()

    # Save main image URL
    db.session.add(ItemImage(item_id=item.id, image_url=main_image_url))

    # Upload additional images if present
    additional_image_urls = []
    additional_files = request.files.getlist('additionalImages')
    for file in additional_files:
        if file and allowed_file(file.filename):
            try:
                uploaded = cloudinary.uploader.upload(file)
                image_url = uploaded.get('secure_url')
                db.session.add(ItemImage(item_id=item.id, image_url=image_url))
                additional_image_urls.append(image_url)
            except Exception as e:
                print("Additional image upload failed:", str(e))
                continue

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Item uploaded successfully",
        "item": {
            "name": item.title,
            "description": item.description,
            "category": item.category,
            "size": item.size,
            "mainImage": main_image_url,
            "additionalImages": additional_image_urls,
            "uploader": {
                "username": User.query.get(user_id).username
            }
        }
    }), 201
