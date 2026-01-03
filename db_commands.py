from flask import Flask
from models import db
from config import Config
import sys

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def init_db():
    with app.app_context():
        try:
            # Test connection
            db.engine.connect()
            print("Successfully connected to the database")
            
            # Create tables
            db.create_all()
            print("Successfully created all tables")
            
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "init":
            init_db()
    else:
        print("Available commands:")
        print("python db_commands.py init  - Initialize the database")