from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from models import db, Order, Cart, Product, AddressBook

orders_bp = Blueprint('orders', __name__)


@orders_bp.route('/create', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order from cart items"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        # Get cart items for the user
        cart_items = Cart.query.filter_by(user_id=user_id).all()
        
        if not cart_items:
            return jsonify({
                'success': False,
                'error': 'Your cart is empty'
            }), 400

        # Extract shipping address
        shipping_address = data.get('shipping_address', {})
        email = data.get('email')
        payment_method = data.get('payment_method', 'cod')

        # Create address book entry if not already exists
        address_text = f"{shipping_address.get('address')}, {shipping_address.get('city')}, {shipping_address.get('state')} {shipping_address.get('postal_code')}, {shipping_address.get('country')}"
        
        address_book = AddressBook(
            user_id=user_id,
            address=address_text
        )
        db.session.add(address_book)
        db.session.flush()  # Get the address_id

        # Calculate total amount
        total_amount = sum(item.product.mrp * item.quantity for item in cart_items if item.product)

        # Create orders for each cart item
        orders = []
        for item in cart_items:
            if not item.product:
                continue
            order = Order(
                user_id=user_id,
                product_id=item.product_id,
                status='pending',
                payment=item.product.mrp * item.quantity,
                mode_of_payment=payment_method,
                date=datetime.now(timezone.utc)
            )
            db.session.add(order)
            orders.append(order)

        # Clear the cart after creating orders
        Cart.query.filter_by(user_id=user_id).delete()

        # Commit all changes
        db.session.commit()

        # Get the first order ID for reference
        first_order_id = orders[0].order_id if orders else None

        print(f"DEBUG: Order created successfully. Order ID: {first_order_id}, User ID: {user_id}")

        return jsonify({
            'success': True,
            'data': {
                'order_id': first_order_id,
                'total_amount': total_amount,
                'payment_method': payment_method,
                'message': f'Order placed successfully! {len(orders)} item(s) ordered.'
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        print(f"DEBUG: Error creating order: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to create order: {str(e)}'
        }), 500


@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get order details"""
    try:
        user_id = int(get_jwt_identity())
        
        order = Order.query.filter_by(order_id=order_id, user_id=user_id).first()
        
        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404

        return jsonify({
            'success': True,
            'data': {
                'order_id': order.order_id,
                'status': order.status,
                'product_id': order.product_id,
                'product_name': order.product.name if order.product else 'Unknown',
                'payment': order.payment,
                'payment_method': order.mode_of_payment,
                'date': order.date.isoformat() if order.date else None
            }
        }), 200

    except Exception as e:
        print(f"DEBUG: Error fetching order: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to fetch order: {str(e)}'
        }), 500


@orders_bp.route('/user/all', methods=['GET'])
@jwt_required()
def get_user_orders():
    """Get all orders for the logged-in user"""
    try:
        user_id = int(get_jwt_identity())
        
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.date.desc()).all()
        
        orders_data = []
        for order in orders:
            orders_data.append({
                'order_id': order.order_id,
                'status': order.status,
                'product_id': order.product_id,
                'product_name': order.product.name if order.product else 'Unknown',
                'payment': order.payment,
                'payment_method': order.mode_of_payment,
                'date': order.date.isoformat() if order.date else None
            })

        return jsonify({
            'success': True,
            'data': {
                'orders': orders_data,
                'count': len(orders_data)
            }
        }), 200

    except Exception as e:
        print(f"DEBUG: Error fetching user orders: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to fetch orders: {str(e)}'
        }), 500
