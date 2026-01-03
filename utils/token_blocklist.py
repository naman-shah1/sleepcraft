import redis
from datetime import datetime, timezone
from config import Config

# Initialize Redis client
redis_client = redis.Redis(
    host=Config.REDIS_HOST if hasattr(Config, 'REDIS_HOST') else 'localhost',
    port=Config.REDIS_PORT if hasattr(Config, 'REDIS_PORT') else 6379,
    db=0,
    decode_responses=True
)

def add_to_blocklist(jti, exp_timestamp):
    """Add a token to the blocklist with expiration"""
    try:
        # Calculate TTL (time until token expiration)
        exp_datetime = datetime.fromtimestamp(exp_timestamp, timezone.utc)
        now = datetime.now(timezone.utc)
        ttl = int((exp_datetime - now).total_seconds())
        
        if ttl > 0:
            redis_client.setex(f'token_blocklist:{jti}', ttl, 'true')
            return True
    except Exception as e:
        print(f"Error adding token to blocklist: {e}")
    return False

def is_token_blocked(jti):
    """Check if a token is in the blocklist"""
    try:
        return redis_client.exists(f'token_blocklist:{jti}')
    except Exception as e:
        print(f"Error checking token blocklist: {e}")
        return False  # If Redis unavailable, allow tokens (development mode)