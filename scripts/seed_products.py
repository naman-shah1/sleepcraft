import os
import sys

# Ensure project root is on path so top-level imports work when run from scripts/
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from models import db, Product

SAMPLE_PRODUCTS = [
    {
        'name': 'Classic 3-Seater Sofa',
        'category': 'Sofa',
        'mrp': 24999.00,
        'discount': 10.0,
        'description': 'A comfortable classic 3-seater sofa with premium cushioning.',
        'image_url': 'https://via.placeholder.com/400x300?text=Classic+Sofa'
    },
    {
        'name': 'Luxury Queen Mattress',
        'category': 'Mattress',
        'mrp': 17999.00,
        'discount': 15.0,
        'description': 'Orthopedic queen mattress with cooling gel layer for optimal sleep.',
        'image_url': 'https://via.placeholder.com/400x300?text=Queen+Mattress'
    },
    {
        'name': 'Recliner Armchair',
        'category': 'Chair',
        'mrp': 7999.00,
        'discount': 5.0,
        'description': 'Compact recliner armchair with smooth reclining mechanism.',
        'image_url': 'https://via.placeholder.com/400x300?text=Recliner+Chair'
    },
    {
        'name': 'Wooden Coffee Table',
        'category': 'Table',
        'mrp': 3999.00,
        'discount': 0.0,
        'description': 'Solid wood coffee table with natural finish.',
        'image_url': 'https://via.placeholder.com/400x300?text=Coffee+Table'
    },
    {
        'name': 'Modular TV Unit',
        'category': 'Storage',
        'mrp': 9999.00,
        'discount': 12.0,
        'description': 'Stylish modular TV unit with storage cabinets and cable management.',
        'image_url': 'https://via.placeholder.com/400x300?text=TV+Unit'
    }
]


def seed_products():
    with app.app_context():
        created = 0
        for p in SAMPLE_PRODUCTS:
            # Use name uniqueness to avoid duplicates
            existing = Product.query.filter_by(name=p['name']).first()
            if existing:
                continue
            prod = Product(
                name=p['name'],
                category=p['category'],
                mrp=p['mrp'],
                discount=p['discount'],
                description=p['description'],
                image_url=p['image_url']
            )
            db.session.add(prod)
            created += 1
        if created > 0:
            db.session.commit()
        print(f"Seed complete. {created} products added (or 0 if they already existed).")


if __name__ == '__main__':
    seed_products()
