"""
Shared Flask extensions (limiter, jwt, etc.) to avoid circular imports.
Import from this module instead of directly from app.
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

jwt = JWTManager()
