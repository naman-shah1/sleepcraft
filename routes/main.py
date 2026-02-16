import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from flask import Blueprint, request, jsonify
from models import db, Product
from sqlalchemy import or_, asc, desc


main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    # Grab a few products as featured
    featured_products = Product.query.limit(8).all()

    # Collect distinct categories from products (string field)
    categories = db.session.query(Product.category).distinct().all()
    categories = [c[0] for c in categories if c[0]]  # Flatten tuples, filter out None

    featured_data = [
        {
            'id': p.product_id,
            'name': p.name,
            'description': p.description,
            'price': float(p.mrp),
            'category': p.category,
            'image': p.image_url,
            # model doesn't have in_stock; provide conservative default
            'in_stock': True
        }
        for p in featured_products
    ]

    return jsonify({
        'success': True,
        'data': {
            'featured_products': featured_data,
            'categories': categories
        }
    })

@main_bp.route('/contact')
def contact():
    return jsonify({
        'success': True,
        'data': {
            'page': 'contact',
            'message': 'Contact page endpoint - customer support inquiries should be sent to support@sleepcraft.com'
        }
    })

@main_bp.route('/privacy')
def privacy():
    return jsonify({
        'success': True,
        'data': {
            'page': 'privacy',
            'message': 'Privacy policy content goes here'
        }
    })

@main_bp.route('/terms')
def terms():
    return jsonify({
        'success': True,
        'data': {
            'page': 'terms',
            'message': 'Terms and conditions content goes here'
        }
    })

@main_bp.route('/size-guide')
def size_guide():
    return jsonify({
        'success': True,
        'data': {
            'page': 'size-guide',
            'message': 'Size guide information goes here'
        }
    })


@main_bp.route('/search')
def search():
    query = request.args.get('q', '').strip()
    page = max(1, request.args.get('page', 1, type=int))
    per_page = 12
    
    if query and len(query) >= 2:  # Minimum 2 characters for search
        # Use ilike for case-insensitive search and escape special characters
        search_term = "%{}%".format(query.replace('%', r'\%').replace('_', r'\_'))

        products_query = Product.query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.category.ilike(search_term)
            )
        )

        # Sorting support
        sort = request.args.get('sort', '').lower()
        if sort == 'price_asc':
            products_query = products_query.order_by(asc(Product.mrp))
        elif sort == 'price_desc':
            products_query = products_query.order_by(desc(Product.mrp))
        elif sort == 'name_desc':
            products_query = products_query.order_by(desc(Product.name))
        else:
            # default: name ascending
            products_query = products_query.order_by(asc(Product.name))
        
        # Paginate results
        pagination = products_query.paginate(page=page, per_page=per_page, error_out=False)
        products = pagination.items
        total_results = pagination.total
        
        products_data = [
            {
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'price': float(p.price),
                'category': p.category,
                'image': p.image,
                'in_stock': p.in_stock
            }
            for p in products
        ]
    else:
        pagination = None
        products_data = []
        total_results = 0
    
    return jsonify({
        'success': True,
        'data': {
            'query': query,
            'products': products_data,
            'total_results': total_results,
            'page': page,
            'per_page': per_page,
            'has_next': pagination.has_next if pagination else False,
            'has_prev': pagination.has_prev if pagination else False
        }
    })

