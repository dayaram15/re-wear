from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Swap, Redemption, Item, User
from datetime import datetime

swap_bp = Blueprint('swap', __name__, url_prefix='/api/swap')


@swap_bp.route('/request', methods=['POST'])
@jwt_required()
def create_swap_request():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    required_fields = ['requested_item_id', 'swap_type']
    if not all(field in data for field in required_fields):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
    
    requested_item_id = data['requested_item_id']
    swap_type = data['swap_type']
    offered_item_id = data.get('offered_item_id')
    points_used = data.get('points_used', 0)
    
    # Validate requested item
    requested_item = Item.query.get(requested_item_id)
    if not requested_item:
        return jsonify({"success": False, "message": "Requested item not found"}), 404
    
    if requested_item.status != 'available':
        return jsonify({"success": False, "message": "Item is not available for swap"}), 400
    
    if requested_item.uploader_id == user_id:
        return jsonify({"success": False, "message": "Cannot request your own item"}), 400
    
    # Handle different swap types
    if swap_type == 'direct':
        if not offered_item_id:
            return jsonify({"success": False, "message": "Offered item required for direct swap"}), 400
        
        offered_item = Item.query.get(offered_item_id)
        if not offered_item:
            return jsonify({"success": False, "message": "Offered item not found"}), 404
        
        if offered_item.uploader_id != user_id:
            return jsonify({"success": False, "message": "You can only offer your own items"}), 400
        
        if offered_item.status != 'available':
            return jsonify({"success": False, "message": "Offered item is not available"}), 400
    
    elif swap_type == 'points':
        user = User.query.get(user_id)
        if user.points_balance < points_used:
            return jsonify({"success": False, "message": "Insufficient points"}), 400
        
        # Create redemption record
        redemption = Redemption(
            user_id=user_id,
            item_id=requested_item_id,
            points_used=points_used,
            status='pending'
        )
        db.session.add(redemption)
        
        # Deduct points
        user.points_balance -= points_used
    
    # Create swap request
    swap = Swap(
        requester_id=user_id,
        requested_item_id=requested_item_id,
        offered_item_id=offered_item_id,
        swap_type=swap_type,
        status='pending'
    )
    
    db.session.add(swap)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Swap request created successfully",
        "swap_id": swap.id
    }), 201


@swap_bp.route('/<int:swap_id>/respond', methods=['POST'])
@jwt_required()
def respond_to_swap(swap_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if 'action' not in data:
        return jsonify({"success": False, "message": "Action required"}), 400
    
    action = data['action']
    if action not in ['accept', 'reject']:
        return jsonify({"success": False, "message": "Invalid action"}), 400
    
    swap = Swap.query.get(swap_id)
    if not swap:
        return jsonify({"success": False, "message": "Swap request not found"}), 404
    
    # Check if user owns the requested item
    requested_item = Item.query.get(swap.requested_item_id)
    if requested_item.uploader_id != user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 403
    
    if swap.status != 'pending':
        return jsonify({"success": False, "message": "Swap request already processed"}), 400
    
    if action == 'accept':
        swap.status = 'accepted'
        requested_item.status = 'swapped'
        
        if swap.offered_item_id:
            offered_item = Item.query.get(swap.offered_item_id)
            offered_item.status = 'swapped'
        
        # Handle points redemption
        if swap.swap_type == 'points':
            redemption = Redemption.query.filter_by(
                user_id=swap.requester_id,
                item_id=swap.requested_item_id
            ).first()
            if redemption:
                redemption.status = 'completed'
    
    else:  # reject
        swap.status = 'rejected'
        
        # Refund points if it was a points swap
        if swap.swap_type == 'points':
            redemption = Redemption.query.filter_by(
                user_id=swap.requester_id,
                item_id=swap.requested_item_id
            ).first()
            if redemption:
                user = User.query.get(swap.requester_id)
                user.points_balance += redemption.points_used
                redemption.status = 'cancelled'
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"Swap request {action}ed successfully"
    }), 200


@swap_bp.route('/my-requests', methods=['GET'])
@jwt_required()
def get_my_swap_requests():
    user_id = int(get_jwt_identity())
    
    swaps = Swap.query.filter_by(requester_id=user_id).all()
    
    swap_data = []
    for swap in swaps:
        requested_item = Item.query.get(swap.requested_item_id)
        offered_item = Item.query.get(swap.offered_item_id) if swap.offered_item_id else None
        
        swap_data.append({
            "id": swap.id,
            "swap_type": swap.swap_type,
            "status": swap.status,
            "created_at": swap.created_at.isoformat(),
            "requested_item": {
                "id": requested_item.id,
                "title": requested_item.title,
                "category": requested_item.category,
                "condition": requested_item.condition,
                "uploader": User.query.get(requested_item.uploader_id).username
            },
            "offered_item": {
                "id": offered_item.id,
                "title": offered_item.title,
                "category": offered_item.category,
                "condition": offered_item.condition
            } if offered_item else None
        })
    
    return jsonify({
        "success": True,
        "swaps": swap_data
    }), 200


@swap_bp.route('/received-requests', methods=['GET'])
@jwt_required()
def get_received_swap_requests():
    user_id = int(get_jwt_identity())
    
    # Get swaps where user owns the requested item
    swaps = db.session.query(Swap).join(Item, Swap.requested_item_id == Item.id).filter(
        Item.uploader_id == user_id,
        Swap.status == 'pending'
    ).all()
    
    swap_data = []
    for swap in swaps:
        requested_item = Item.query.get(swap.requested_item_id)
        offered_item = Item.query.get(swap.offered_item_id) if swap.offered_item_id else None
        requester = User.query.get(swap.requester_id)
        
        swap_data.append({
            "id": swap.id,
            "swap_type": swap.swap_type,
            "status": swap.status,
            "created_at": swap.created_at.isoformat(),
            "requester": {
                "id": requester.id,
                "username": requester.username,
                "name": requester.name
            },
            "requested_item": {
                "id": requested_item.id,
                "title": requested_item.title,
                "category": requested_item.category,
                "condition": requested_item.condition
            },
            "offered_item": {
                "id": offered_item.id,
                "title": offered_item.title,
                "category": offered_item.category,
                "condition": offered_item.condition
            } if offered_item else None
        })
    
    return jsonify({
        "success": True,
        "swaps": swap_data
    }), 200
