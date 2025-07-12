from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Item, User, AdminAction, Swap, Redemption
from sqlalchemy import func
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def check_admin():
    """Helper function to check if user is admin"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return False, user
    return True, user


@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def admin_dashboard():
    is_admin, user = check_admin()
    if not is_admin:
        return jsonify({"success": False, "message": "Admin access required"}), 403
    
    # Get statistics
    total_users = User.query.count()
    total_items = Item.query.count()
    pending_items = Item.query.filter_by(approved=False).count()
    total_swaps = Swap.query.count()
    completed_swaps = Swap.query.filter_by(status='accepted').count()
    
    # Recent activity
    recent_items = Item.query.order_by(Item.created_at.desc()).limit(5).all()
    recent_swaps = Swap.query.order_by(Swap.created_at.desc()).limit(5).all()
    
    # Items by category
    category_stats = db.session.query(
        Item.category, 
        func.count(Item.id)
    ).group_by(Item.category).all()
    
    return jsonify({
        "success": True,
        "stats": {
            "total_users": total_users,
            "total_items": total_items,
            "pending_items": pending_items,
            "total_swaps": total_swaps,
            "completed_swaps": completed_swaps
        },
        "recent_items": [{
            "id": item.id,
            "title": item.title,
            "category": item.category,
            "status": item.status,
            "approved": item.approved,
            "created_at": item.created_at.isoformat(),
            "uploader": User.query.get(item.uploader_id).username
        } for item in recent_items],
        "recent_swaps": [{
            "id": swap.id,
            "swap_type": swap.swap_type,
            "status": swap.status,
            "created_at": swap.created_at.isoformat(),
            "requester": User.query.get(swap.requester_id).username
        } for swap in recent_swaps],
        "category_stats": [{
            "category": category,
            "count": count
        } for category, count in category_stats]
    }), 200


@admin_bp.route('/items/pending', methods=['GET'])
@jwt_required()
def get_pending_items():
    is_admin, user = check_admin()
    if not is_admin:
        return jsonify({"success": False, "message": "Admin access required"}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pending_items = Item.query.filter_by(approved=False).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    items_data = []
    for item in pending_items.items:
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
            "total": pending_items.total,
            "pages": pending_items.pages
        }
    }), 200


@admin_bp.route('/items/<int:item_id>/moderate', methods=['POST'])
@jwt_required()
def moderate_item(item_id):
    is_admin, user = check_admin()
    if not is_admin:
        return jsonify({"success": False, "message": "Admin access required"}), 403
    
    admin_id = int(get_jwt_identity())
    data = request.get_json()
    
    if 'action' not in data:
        return jsonify({"success": False, "message": "Action required"}), 400
    
    action = data['action']
    reason = data.get('reason', '')
    
    if action not in ['approve', 'reject', 'remove']:
        return jsonify({"success": False, "message": "Invalid action"}), 400
    
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"success": False, "message": "Item not found"}), 404
    
    # Record admin action
    admin_action = AdminAction(
        admin_id=admin_id,
        item_id=item_id,
        action=action,
        reason=reason
    )
    db.session.add(admin_action)
    
    if action == 'approve':
        item.approved = True
        item.status = 'available'
    elif action == 'reject':
        item.approved = False
        item.status = 'rejected'
    elif action == 'remove':
        item.status = 'removed'
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"Item {action}ed successfully"
    }), 200


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    is_admin, user = check_admin()
    if not is_admin:
        return jsonify({"success": False, "message": "Admin access required"}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    users = User.query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    users_data = []
    for user in users.items:
        items_count = Item.query.filter_by(uploader_id=user.id).count()
        swaps_count = Swap.query.filter_by(requester_id=user.id).count()
        
        users_data.append({
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "is_admin": user.is_admin,
            "points_balance": user.points_balance,
            "created_at": user.created_at.isoformat(),
            "stats": {
                "items_count": items_count,
                "swaps_count": swaps_count
            }
        })
    
    return jsonify({
        "success": True,
        "users": users_data,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": users.total,
            "pages": users.pages
        }
    }), 200


@admin_bp.route('/users/<int:user_id>/toggle-admin', methods=['POST'])
@jwt_required()
def toggle_admin_status(user_id):
    is_admin, user = check_admin()
    if not is_admin:
        return jsonify({"success": False, "message": "Admin access required"}), 403
    
    admin_id = int(get_jwt_identity())
    
    if admin_id == user_id:
        return jsonify({"success": False, "message": "Cannot modify your own admin status"}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    user.is_admin = not user.is_admin
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"User admin status {'enabled' if user.is_admin else 'disabled'}",
        "is_admin": user.is_admin
    }), 200


@admin_bp.route('/users/<int:user_id>/add-points', methods=['POST'])
@jwt_required()
def add_points(user_id):
    is_admin, user = check_admin()
    if not is_admin:
        return jsonify({"success": False, "message": "Admin access required"}), 403
    
    data = request.get_json()
    
    if 'points' not in data:
        return jsonify({"success": False, "message": "Points amount required"}), 400
    
    points = data['points']
    if not isinstance(points, int) or points <= 0:
        return jsonify({"success": False, "message": "Points must be a positive integer"}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    user.points_balance += points
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"{points} points added to user",
        "new_balance": user.points_balance
    }), 200


@admin_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_admin_reports():
    is_admin, user = check_admin()
    if not is_admin:
        return jsonify({"success": False, "message": "Admin access required"}), 403
    
    # Get recent admin actions
    recent_actions = AdminAction.query.order_by(
        AdminAction.created_at.desc()
    ).limit(20).all()
    
    actions_data = []
    for action in recent_actions:
        admin = User.query.get(action.admin_id)
        item = Item.query.get(action.item_id)
        
        actions_data.append({
            "id": action.id,
            "action": action.action,
            "reason": action.reason,
            "created_at": action.created_at.isoformat(),
            "admin": {
                "id": admin.id,
                "username": admin.username
            },
            "item": {
                "id": item.id,
                "title": item.title
            } if item else None
        })
    
    return jsonify({
        "success": True,
        "recent_actions": actions_data
    }), 200
