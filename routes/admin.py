from flask import Blueprint, request, jsonify
from models import db, User, Order, Product, Cart, Wishlist
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)


# Dashboard Statistics
@admin_bp.route('/dashboard', methods=['GET'])
def dashboard():
    """Get admin dashboard statistics"""
    try:
        # Count statistics
        total_users = User.query.count()
        total_orders = Order.query.count()
        total_products = Product.query.count()
        
        # Revenue calculation
        total_revenue = sum(order.payment for order in Order.query.all())
        
        # Orders by status
        pending_orders = Order.query.filter_by(status='pending').count()
        confirmed_orders = Order.query.filter_by(status='confirmed').count()
        shipped_orders = Order.query.filter_by(status='shipped').count()
        delivered_orders = Order.query.filter_by(status='delivered').count()
        
        # Recent orders
        recent_orders = Order.query.order_by(Order.date.desc()).limit(5).all()
        
        recent_orders_data = []
        for order in recent_orders:
            recent_orders_data.append({
                'order_id': order.order_id,
                'user_id': order.user_id,
                'user_name': order.user.name if order.user else 'Unknown',
                'product_id': order.product_id,
                'product_name': order.product.name if order.product else 'Unknown',
                'amount': float(order.payment),
                'status': order.status,
                'date': order.date.isoformat() if order.date else None
            })
        
        return jsonify({
            'success': True,
            'data': {
                'stats': {
                    'total_users': total_users,
                    'total_orders': total_orders,
                    'total_products': total_products,
                    'total_revenue': float(total_revenue),
                    'orders_by_status': {
                        'pending': pending_orders,
                        'confirmed': confirmed_orders,
                        'shipped': shipped_orders,
                        'delivered': delivered_orders
                    }
                },
                'recent_orders': recent_orders_data
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# Users Management
@admin_bp.route('/users', methods=['GET'])

def get_users():
    """Get all users with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        users = User.query.paginate(page=page, per_page=per_page)
        
        users_data = []
        for user in users.items:
            users_data.append({
                'user_id': user.user_id,
                'name': user.name,
                'email': user.email,
                'mobile_number': user.mobile_number,
                'oauth_provider': user.oauth_provider,
                'is_verified': user.is_verified,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'created_at': user.name  # Assuming name field, you might need to add created_at
            })
        
        return jsonify({
            'success': True,
            'data': {
                'users': users_data,
                'total': users.total,
                'pages': users.pages,
            'current_page': page
            }}
        ), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_details(user_id):
    """Get detailed user information"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Get user's orders
        user_orders = Order.query.filter_by(user_id=user_id).all()
        orders_data = [{
            'order_id': o.order_id,
            'product_name': o.product.name if o.product else 'Unknown',
            'amount': float(o.payment),
            'status': o.status,
            'date': o.date.isoformat() if o.date else None
        } for o in user_orders]
        
        # Get user's wishlist
        wishlist = Wishlist.query.filter_by(user_id=user_id).all()
        wishlist_data = [{
            'product_id': w.product_id,
            'product_name': w.product.name if w.product else 'Unknown'
        } for w in wishlist]
        
        return jsonify({
            'success': True,
            'data': {
                'user': {
                    'user_id': user.user_id,
                    'name': user.name,
                    'email': user.email,
                    'mobile_number': user.mobile_number,
                    'oauth_provider': user.oauth_provider,
                    'profile_picture': user.profile_picture,
                    'is_verified': user.is_verified,
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'total_orders': len(user_orders),
                    'total_spent': sum(o.payment for o in user_orders)
                },
                'orders': orders_data,
                'wishlist': wishlist_data
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# Orders Management
@admin_bp.route('/orders', methods=['GET'])
def get_orders():
    """Get all orders with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status_filter = request.args.get('status', '')
        
        query = Order.query
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        orders = query.order_by(Order.date.desc()).paginate(page=page, per_page=per_page)
        
        orders_data = []
        for order in orders.items:
            orders_data.append({
                'order_id': order.order_id,
                'user_id': order.user_id,
                'user_name': order.user.name if order.user else 'Unknown',
                'user_email': order.user.email if order.user else 'Unknown',
                'product_id': order.product_id,
                'product_name': order.product.name if order.product else 'Unknown',
                'amount': float(order.payment),
                'status': order.status,
                'payment_method': order.mode_of_payment,
                'date': order.date.isoformat() if order.date else None
            })
        
        return jsonify({
            'success': True,
            'data': {
                'orders': orders_data,
                'total': orders.total,
                'pages': orders.pages,
                'current_page': page
            }}
        ), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order_details(order_id):
    """Get detailed order information"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        
        return jsonify({
            'success': True,
            'data': {
                'order_id': order.order_id,
                'user_id': order.user_id,
                'user_name': order.user.name if order.user else 'Unknown',
                'user_email': order.user.email if order.user else 'Unknown',
                'user_phone': order.user.mobile_number if order.user else 'Unknown',
                'product_id': order.product_id,
                'product_name': order.product.name if order.product else 'Unknown',
                'amount': float(order.payment),
                'status': order.status,
                'payment_method': order.mode_of_payment,
                'date': order.date.isoformat() if order.date else None
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']:
            return jsonify({'success': False, 'error': 'Invalid status'}), 400
        
        order.status = new_status
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Order status updated to {new_status}'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# Products Management
@admin_bp.route('/products', methods=['GET'])
def get_products():
    """Get all products with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        products = Product.query.paginate(page=page, per_page=per_page)
        
        products_data = []
        for product in products.items:
            products_data.append({
                'product_id': product.product_id,
                'name': product.name,
                'price': float(product.mrp) if product.mrp else 0,
                'category': product.category if product.category else 'N/A',
                'stock': 'N/A'
            })
        
        return jsonify({
            'success': True,
            'data': {
                'products': products_data,
                'total': products.total,
                'pages': products.pages,
                'current_page': page
            }}
        ), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# Analytics
@admin_bp.route('/analytics/revenue', methods=['GET'])
def revenue_analytics():
    """Get revenue analytics"""
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.now() - timedelta(days=days)
        
        orders = Order.query.filter(Order.date >= start_date).all()
        
        # Group by date
        revenue_by_date = {}
        for order in orders:
            date_key = order.date.strftime('%Y-%m-%d') if order.date else 'Unknown'
            if date_key not in revenue_by_date:
                revenue_by_date[date_key] = 0
            revenue_by_date[date_key] += order.payment
        
        return jsonify({
            'success': True,
            'data': {
                'revenue_by_date': revenue_by_date,
                'total_revenue': sum(revenue_by_date.values()),
                'average_daily_revenue': sum(revenue_by_date.values()) / len(revenue_by_date) if revenue_by_date else 0
            }}
        ), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
