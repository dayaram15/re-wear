from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from app import db
from app.models import Item, ItemImage
from config import Config
from datetime import datetime

item_bp = Blueprint('items', __name__, url_prefix='/api/items')

# Utility function to check allowed extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@item_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_item():
    user_id = get_jwt_identity()

    title = request.form.get('title')
    category = request.form.get('category')
    type_ = request.form.get('type')
    condition = request.form.get('condition')
    description = request.form.get('description', '')
    tags = request.form.get('tags', '')
    size = request.form.get('size', '')

    # Validate required fields
    if not all([title, category, type_, condition]):
        return jsonify({"message": "Missing required fields"}), 400

    # Save item first
    item = Item(
        title=title,
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

    # Now handle multiple image files
    files = request.files.getlist('images')
    image_urls = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join('static/uploads', filename)
            file.save(filepath)

            image = ItemImage(item_id=item.id, image_url=filepath)
            db.session.add(image)
            image_urls.append(filepath)

    db.session.commit()

    return jsonify({
        "message": "Item uploaded successfully",
        "item_id": item.id,
        "images": image_urls
    }), 201
