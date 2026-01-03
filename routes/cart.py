import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Product, Cart, Wishlist
from sqlalchemy import asc, desc

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/')
@jwt_required()
def view_cart():
    user_id = get_jwt_identity()

    # Sorting: ?sort=price_asc|price_desc|name_asc|name_desc|newest|quantity_desc
    sort = request.args.get('sort', '').lower()
    query = Cart.query.filter_by(user_id=user_id).join(Product)

    if sort == 'price_asc':
        query = query.order_by(asc(Product.mrp))
    elif sort == 'price_desc':
        query = query.order_by(desc(Product.mrp))
    elif sort == 'name_desc':
        query = query.order_by(desc(Product.name))
    elif sort == 'newest':
        # newest by cart_id descending
        query = query.order_by(desc(Cart.cart_id))
    elif sort == 'quantity_desc':
        query = query.order_by(desc(Cart.quantity))
    else:
        # default: name ascending
        query = query.order_by(asc(Product.name))

    cart_items = query.all()

    cart_data = [
        {
            'id': item.cart_id,
            'product_id': item.product.product_id,
            'product_name': item.product.name,
            'product_price': float(item.product.mrp),
            'quantity': item.quantity,
            'subtotal': float(item.product.mrp * item.quantity),
            'image': item.product.image_url
        }
        for item in cart_items
    ]

    total_amount = sum(item.product.mrp * item.quantity for item in cart_items)

    return jsonify({
        'success': True,
        'data': {
            'cart_items': cart_data,
            'total_amount': float(total_amount),
            'item_count': len(cart_items)
        }
    })

@cart_bp.route('/add/<int:product_id>', methods=['POST'])
@jwt_required()
def add_to_cart(product_id):
    try:
        user_id = get_jwt_identity()
        product = Product.query.get_or_404(product_id)
        
        # Get quantity from JSON or form data
        data = request.get_json() or {}
        quantity = data.get('quantity', request.form.get('quantity', 1))
        
        # Validate and sanitize quantity input
        try:
            quantity = max(1, min(int(quantity), 99))  # Limit quantity range
        except (ValueError, TypeError):
            quantity = 1
        
        # Use a transaction to ensure data consistency
        try:
            cart_item = Cart.query.filter_by(
                user_id=user_id, 
                product_id=product_id
            ).with_for_update().first()  # Lock the row for update
            
            if cart_item:
                cart_item.quantity = min(cart_item.quantity + quantity, 99)  # Prevent overflow
            else:
                cart_item = Cart(
                    user_id=user_id,
                    product_id=product_id,
                    quantity=quantity
                )
                db.session.add(cart_item)
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': f'{product.name} added to cart!',
                'cart_count': Cart.query.filter_by(user_id=user_id).count()
            })
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': 'Database error'}), 500
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Server error'}), 500

@cart_bp.route('/update/<int:item_id>', methods=['POST'])
@jwt_required()
def update_cart(item_id):
    user_id = get_jwt_identity()
    cart_item = Cart.query.filter_by(
        cart_id=item_id,
        user_id=user_id
    ).first_or_404()
    
    data = request.get_json() or {}
    quantity = int(data.get('quantity', request.form.get('quantity', 1)))
    
    if quantity <= 0:
        db.session.delete(cart_item)
        message = 'Item removed from cart'
    else:
        cart_item.quantity = quantity
        message = 'Cart updated'
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': message,
        'cart_count': Cart.query.filter_by(user_id=user_id).count()
    })

@cart_bp.route('/remove/<int:item_id>', methods=['POST'])
@jwt_required()
def remove_from_cart(item_id):
    user_id = get_jwt_identity()
    cart_item = Cart.query.filter_by(
        cart_id=item_id,
        user_id=user_id
    ).first_or_404()
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Item removed from cart',
        'cart_count': Cart.query.filter_by(user_id=user_id).count()
    })

@cart_bp.route('/wishlist')
@jwt_required()
def view_wishlist():
    user_id = get_jwt_identity()
    wishlist_items = Wishlist.query.filter_by(user_id=user_id).all()
    
    wishlist_data = [
        {
            'id': item.wishlist_id,
            'product_id': item.product.product_id,
            'product_name': item.product.name,
            'product_price': float(item.product.mrp),
            'product_category': item.product.category,
            'image': item.product.image_url,
        }
        for item in wishlist_items
    ]
    
    return jsonify({
        'success': True,
        'data': {
            'wishlist_items': wishlist_data,
            'item_count': len(wishlist_items)
        }
    })

@cart_bp.route('/wishlist/add/<int:product_id>', methods=['POST'])
@jwt_required()
def add_to_wishlist(product_id):
    try:
        user_id = get_jwt_identity()
        product = Product.query.get_or_404(product_id)
        
        # Use a transaction with row-level locking
        try:
            existing_item = Wishlist.query.filter_by(
                user_id=user_id,
                product_id=product_id
            ).with_for_update().first()
            
            if not existing_item:
                wishlist_item = Wishlist(
                    user_id=user_id,
                    product_id=product_id
                )
                db.session.add(wishlist_item)
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'message': f'{product.name} added to wishlist!',
                    'wishlist_count': Wishlist.query.filter_by(user_id=user_id).count()
                })
            else:
                return jsonify({
                    'success': False,
                    'message': f'{product.name} is already in your wishlist!'
                }), 409
                
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': 'Error updating wishlist. Please try again.'}), 500
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'An error occurred. Please try again.'}), 500

@cart_bp.route('/wishlist/remove/<int:item_id>', methods=['POST'])
@jwt_required()
def remove_from_wishlist(item_id):
    user_id = get_jwt_identity()
    wishlist_item = Wishlist.query.filter_by(
        wishlist_id=item_id,
        user_id=user_id
    ).first_or_404()
    
    db.session.delete(wishlist_item)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Item removed from wishlist',
        'wishlist_count': Wishlist.query.filter_by(user_id=user_id).count()
    })

