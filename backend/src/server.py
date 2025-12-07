from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os, json
from src.db import db
import src.models
import firebase_admin
from firebase_admin import credentials, auth

def create_app():
    app = Flask(__name__)

    app.secret_key = os.environ["FLASK_SECRET_KEY"]

    try:
        cred = credentials.Certificate("/app/serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin initialized successfully.")
    except Exception as e:
        print(f"❌ Error initializing Firebase Admin: {e}")
                
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE_FOLDER = os.path.join(BASE_DIR, '..', 'databases')
    os.makedirs(DATABASE_FOLDER, exist_ok=True)
    DB_PATH = os.path.join(BASE_DIR, '..', 'databases', 'pre_auth.db')  

    UPLOAD_FOLDER = os.path.join(os.getcwd(), "temp")
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

    db.init_app(app)

    # ================ Register Blueprints ===================#
    from src.routes.auth_routes import auth_bp
    from src.routes.pdf_routes import pdf_bp
    from src.routes.form_routes import form_bp
    from src.routes.llm_routes import llm_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(pdf_bp, url_prefix="/pdf")
    app.register_blueprint(form_bp, url_prefix="/form")
    app.register_blueprint(llm_bp, url_prefix="/llm")

    with app.app_context():
        if not os.path.exists(DB_PATH):
            print("✅ Database does not exist. Creating a new one...")
            db.create_all()  # Only create tables if the DB doesn't exist
        else:
            print("✅ Database already exists.")
        print("✅ Database ready.")

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)