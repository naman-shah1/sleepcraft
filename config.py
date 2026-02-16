import os
from datetime import timedelta
from urllib.parse import urlparse


# Helper function to validate and normalize DATABASE_URL before class definition
def _get_database_uri():
    """Validate and normalize DATABASE_URL for Aiven PostgreSQL."""
    raw_url = os.environ.get('DATABASE_URL')
    if not raw_url:
        raise RuntimeError('DATABASE_URL environment variable is required and must point to your Aiven PostgreSQL')
    
    db_url = raw_url.strip()
    
    # Convert legacy postgres:// scheme to postgresql://
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    
    # Quick placeholder detection
    placeholders = ['your-aiven', 'your_aiven', 'your-aiven-host', 'your-aiven-port', 'your-aiven-username', 'your-aiven-password']
    if any(ph in db_url for ph in placeholders):
        raise RuntimeError('DATABASE_URL appears to contain placeholder values; set it to your real Aiven connection string')
    
    # Basic port validation
    try:
        parsed = urlparse(db_url)
        if parsed.port is not None:
            int(parsed.port)
    except Exception as e:
        raise RuntimeError(f'Invalid DATABASE_URL: unable to parse port - {e}')
    
    return db_url


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'anupam-world-secret-key-2024'

    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-2024'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ERROR_MESSAGE_KEY = 'message'

    # DATABASE configuration - Aiven PostgreSQL required
    # The application requires a valid DATABASE_URL environment variable pointing
    # to an Aiven PostgreSQL instance. Do NOT use sqlite or placeholders in production.
    SQLALCHEMY_DATABASE_URI = _get_database_uri()

    # OAuth Configuration
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

    # SSL Configuration for Aiven (optional - only added if cert env vars provided)
    # SSL configuration: Aiven typically requires sslmode=require. If you have
    # certificate files, set PGSSLCERT, PGSSLKEY and PGSSLROOTCERT env vars.
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {
            'sslmode': os.environ.get('PGSSLMODE', 'require'),
            'sslcert': os.environ.get('PGSSLCERT'),
            'sslkey': os.environ.get('PGSSLKEY'),
            'sslrootcert': os.environ.get('PGSSLROOTCERT')
        }
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # Upload settings
    UPLOAD_FOLDER = 'static/uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
