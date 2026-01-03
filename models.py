from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Product(db.Model):
    __tablename__ = 'product'
    product_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    mrp = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, default=0.0)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(200))  # Made nullable for OAuth users
    mobile_number = db.Column(db.String(20), unique=True)  # Made nullable for OAuth users
    type_of_product = db.Column(db.String(100))
    
    # OAuth specific fields
    oauth_provider = db.Column(db.String(50))  # 'google', 'local', etc.
    oauth_id = db.Column(db.String(200))  # Provider specific user ID
    profile_picture = db.Column(db.String(500))  # URL to profile picture
    is_verified = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    
    addresses = db.relationship('AddressBook', backref='user', lazy=True)

    def set_password(self, password):
        if password:
            self.password_hash = generate_password_hash(password)
            
    def check_password(self, password):
        if self.password_hash:
            return check_password_hash(self.password_hash, password)
        return False
    
    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.user_id)
        
    @classmethod
    def get_or_create_oauth_user(cls, oauth_provider, oauth_id, email, name, profile_picture=None):
        user = cls.query.filter_by(oauth_provider=oauth_provider, oauth_id=oauth_id).first()
        if not user:
            user = cls.query.filter_by(email=email).first()
            if user:
                # Link existing account with OAuth
                user.oauth_provider = oauth_provider
                user.oauth_id = oauth_id
                user.profile_picture = profile_picture
            else:
                # Create new user
                user = cls(
                    oauth_provider=oauth_provider,
                    oauth_id=oauth_id,
                    email=email,
                    name=name,
                    profile_picture=profile_picture,
                    is_verified=True
                )
                db.session.add(user)
        
        user.last_login = datetime.utcnow()
        db.session.commit()
        return user



class Cart(db.Model):
    __tablename__ = 'cart'
    cart_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    user = db.relationship('User', backref=db.backref('cart_items', lazy=True))
    product = db.relationship('Product')

class Wishlist(db.Model):
    __tablename__ = 'wishlist'
    wishlist_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'), nullable=False)

    user = db.relationship('User', backref=db.backref('wishlist_items', lazy=True))
    product = db.relationship('Product')

class Order(db.Model):
    __tablename__ = 'order'
    order_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    invoice = db.Column(db.String(255))
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'), nullable=False)
    payment = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    mode_of_payment = db.Column(db.String(50))

    user = db.relationship('User', backref=db.backref('orders', lazy=True))
    product = db.relationship('Product')

class Service(db.Model):
    __tablename__ = 'service'
    service_id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.Text, nullable=False)
    service_status = db.Column(db.String(50), nullable=False)
    payment = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    agent = db.Column(db.String(100))

    user = db.relationship('User', backref=db.backref('services', lazy=True))

class AddressBook(db.Model):
    __tablename__ = 'address_book'
    address_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    address = db.Column(db.Text, nullable=False)
