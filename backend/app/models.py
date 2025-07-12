from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from app import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    profile_picture = db.Column(db.String(1000), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    points_balance = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    #add username and profile picture

    items = db.relationship('Item', backref='uploader', lazy=True)
    swap_requests = db.relationship('Swap',foreign_keys='Swap.requester_id', backref='requester', lazy=True)
    redemptions = db.relationship('Redemption', backref='user', lazy=True)
    admin_actions = db.relationship('AdminAction', backref='admin', lazy=True)

class Item(db.Model):
        __tablename__ = 'items'

        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(200), nullable=False)
        description = db.Column(db.Text, nullable=True)
        category = db.Column(db.String(50), nullable=False)
        type = db.Column(db.String(50), nullable=False)
        size = db.Column(db.String(50), nullable=True)
        condition = db.Column(db.String(50), nullable=False)
        tags = db.Column(db.String(200), nullable=True)
        status = db.Column(db.String(50), default='available')
        approved = db.Column(db.Boolean, default=False)
        uploader_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)

        images = db.relationship('ItemImage', backref='item', lazy=True, cascade='all, delete-orphan')


class ItemImage(db.Model):
        __tablename__ = 'item_images'

        id = db.Column(db.Integer, primary_key=True)
        item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
        image_url = db.Column(db.String(255), nullable=False)


class Swap(db.Model):
        __tablename__ = 'swaps'

        id = db.Column(db.Integer, primary_key=True)
        requester_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        requested_item_id = db.Column(db.Integer, db.ForeignKey('items.id', ondelete='CASCADE'), nullable=False)
        offered_item_id = db.Column(db.Integer, db.ForeignKey('items.id', ondelete='CASCADE'), nullable=False)
        swap_type = db.Column(db.String(50), nullable=False) #direct or points
        status = db.Column(db.String(50), default='pending')    #panding, accepted, rejected , cancelled
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Redemption(db.Model):
        __tablename__ = 'redemptions'

        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        item_id = db.Column(db.Integer, db.ForeignKey('items.id', ondelete='CASCADE'), nullable=False)
        points_used = db.Column(db.Integer, nullable=False)
        status = db.Column(db.String(50), default='pending')
        created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AdminAction(db.Model):
        __tablename__ = 'admin_actions'

        id = db.Column(db.Integer, primary_key=True)
        admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        item_id = db.Column(db.Integer, db.ForeignKey('items.id', ondelete='CASCADE'), nullable=False)  
        action = db.Column(db.String(50), nullable=False)
        reason = db.Column(db.String(255), nullable=True)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)

       