import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from flask import Blueprint, request, abort, jsonify
from models import db, Product
from sqlalchemy import or_, func

products_bp = Blueprint('products', __name__)

@products_bp.route('')
def products_list():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        category = request.args.get('category')
        
        query = Product.query
        
        if category:
            query = query.filter_by(category=category)
            
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'data': {
                'products': [{
                    'id': p.product_id,
                    'name': p.name,
                    'category': p.category,
                    'mrp': p.mrp,
                    'discount': p.discount,
                    'description': p.description,
                    'image_url': p.image_url
                } for p in pagination.items],
                'pagination': {
                    'page': pagination.page,
                    'pages': pagination.pages,
                    'total': pagination.total,
                    'has_next': pagination.has_next,
                    'has_prev': pagination.has_prev
                }
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@products_bp.route('/categories')
def get_categories():
    try:
        categories = db.session.query(Product.category).distinct().all()
        return jsonify({
            'success': True,
            'data': {
                'categories': [c[0] for c in categories]
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@products_bp.route('/<int:product_id>')
def product_detail(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        
        related_products = Product.query.filter(
            Product.category == product.category,
            Product.product_id != product.product_id
        ).limit(4).all()
        
        return jsonify({
            'success': True,
            'data': {
                'product': {
                    'id': product.product_id,
                    'name': product.name,
                    'category': product.category,
                    'mrp': product.mrp,
                    'discount': product.discount,
                    'description': product.description,
                    'image_url': product.image_url
                },
                'related_products': [{
                    'id': p.product_id,
                    'name': p.name,
                    'category': p.category,
                    'mrp': p.mrp,
                    'discount': p.discount,
                    'image_url': p.image_url
                } for p in related_products]
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
