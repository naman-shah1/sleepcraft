#!/usr/bin/env python
"""
Admin Setup Script - Make a user an admin

Usage:
    python admin_setup.py <email>
    
Example:
    python admin_setup.py admin@example.com
"""

import sys
import os
from models import db, User
from app import app

def make_admin(email):
    """Make a user an admin"""
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        
        if not user:
            print(f"❌ Error: User with email '{email}' not found")
            return False
        
        # Set user type to admin
        user.type_of_product = 'admin'
        db.session.commit()
        
        print(f"✅ Success: User '{email}' is now an admin!")
        print(f"   User ID: {user.user_id}")
        print(f"   Name: {user.name}")
        print(f"   Email: {user.email}")
        print(f"   Role: admin")
        print(f"\n   Admin panel available at: http://localhost:3000/admin")
        return True

def list_admins():
    """List all admin users"""
    with app.app_context():
        admins = User.query.filter_by(type_of_product='admin').all()
        
        if not admins:
            print("❌ No admin users found")
            return
        
        print(f"✅ Found {len(admins)} admin user(s):\n")
        for admin in admins:
            print(f"  • {admin.name} ({admin.email}) - ID: {admin.user_id}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python admin_setup.py <email>")
        print("       python admin_setup.py --list")
        print("\nExamples:")
        print("  python admin_setup.py admin@example.com")
        print("  python admin_setup.py --list")
        sys.exit(1)
    
    if sys.argv[1] == '--list':
        list_admins()
    else:
        make_admin(sys.argv[1])
