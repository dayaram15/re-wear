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
    print("=== /upload endpoint called ===")
    user_id = int(get_jwt_identity())
    print("User ID:", user_id)

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
        print("Cloudinary upload error:", str(e))
        return jsonify({
            "success": False,
            "message": "Failed to upload main image to Cloudinary",
            "error": str(e)
        }), 500

    # === Save item only after successful main image upload ===
    try:
        item = Item(
            title=name,
            category=category,
            type=type_,
            condition=condition,
            description=description,
            tags=tags,
            size=size,
            uploader_id=user_id,
            approved=True,  # Auto-approve for development
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
    except Exception as e:
        print("Database error:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Failed to save item to database",
            "error": str(e)
        }), 500


@item_bp.route('/', methods=['GET'])
def get_items():
    """Get all approved items with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    category = request.args.get('category')
    search = request.args.get('search')
    show_all = request.args.get('show_all', 'false').lower() == 'true'  # Development flag
    
    # For development, show all items if show_all=true, otherwise only approved items
    if show_all:
        query = Item.query.filter_by(status='available')
    else:
        query = Item.query.filter_by(approved=True, status='available')
    
    if category:
        query = query.filter_by(category=category)
    
    if search:
        query = query.filter(
            Item.title.ilike(f'%{search}%') | 
            Item.description.ilike(f'%{search}%') |
            Item.tags.ilike(f'%{search}%')
        )
    
    items = query.order_by(Item.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    items_data = []
    for item in items.items:
        uploader = User.query.get(item.uploader_id)
        images = [img.image_url for img in item.images]
        
        items_data.append({
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "type": item.type,
            "size": item.size,
            "condition": item.condition,
            "tags": item.tags,
            "status": item.status,
            "approved": item.approved,  # Include approval status for debugging
            "created_at": item.created_at.isoformat(),
            "uploader": {
                "id": uploader.id,
                "username": uploader.username,
                "name": uploader.name
            },
            "images": images
        })
    
    return jsonify({
        "success": True,
        "items": items_data,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": items.total,
            "pages": items.pages
        }
    }), 200


@item_bp.route('/<int:item_id>', methods=['GET'])
def get_item(item_id):
    """Get a specific item by ID"""
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"success": False, "message": "Item not found"}), 404
    
    uploader = User.query.get(item.uploader_id)
    images = [img.image_url for img in item.images]
    
    return jsonify({
        "success": True,
        "item": {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "type": item.type,
            "size": item.size,
            "condition": item.condition,
            "tags": item.tags,
            "status": item.status,
            "approved": item.approved,
            "created_at": item.created_at.isoformat(),
            "uploader": {
                "id": uploader.id,
                "username": uploader.username,
                "name": uploader.name,
                "points_balance": uploader.points_balance
            },
            "images": images
        }
    }), 200


@item_bp.route('/my-items', methods=['GET'])
@jwt_required()
def get_my_items():
    """Get items uploaded by the current user"""
    user_id = int(get_jwt_identity())
    
    items = Item.query.filter_by(uploader_id=user_id).order_by(Item.created_at.desc()).all()
    
    items_data = []
    for item in items:
        images = [img.image_url for img in item.images]
        
        items_data.append({
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "type": item.type,
            "size": item.size,
            "condition": item.condition,
            "tags": item.tags,
            "status": item.status,
            "approved": item.approved,
            "created_at": item.created_at.isoformat(),
            "images": images
        })
    
    return jsonify({
        "success": True,
        "items": items_data
    }), 200


@item_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all available categories"""
    categories = db.session.query(Item.category).distinct().all()
    return jsonify({
        "success": True,
        "categories": [cat[0] for cat in categories if cat[0]]
    }), 200


@item_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    """Delete an item (only by the uploader or admin)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        item = Item.query.get(item_id)
        
        if not item:
            return jsonify({"success": False, "message": "Item not found"}), 404
        
        # Check if user is the uploader or an admin
        if item.uploader_id != user_id and not user.is_admin:
            return jsonify({"success": False, "message": "Unauthorized to delete this item"}), 403
        
        # Delete associated images from Cloudinary (optional)
        for image in item.images:
            try:
                # Extract public_id from Cloudinary URL
                image_url = image.image_url
                if 'cloudinary.com' in image_url:
                    # Extract public_id from URL (this is a simplified approach)
                    # In production, you might want to store public_id separately
                    pass  # For now, we'll skip Cloudinary deletion to avoid errors
            except Exception as e:
                print(f"Error deleting image from Cloudinary: {e}")
        
        # Delete the item (cascading will handle related records)
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Item deleted successfully"}), 200
        
    except Exception as e:
        print("Delete item error:", str(e))
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to delete item",
            "error": str(e)
        }), 500
