from flask import Blueprint, request, jsonify, session
from firebase_admin import auth
import requests
import os

auth_bp = Blueprint("auth", __name__)

# Firebase API key (from Firebase project settings)
FIREBASE_API_KEY = os.environ.get("FIREBASE_API_KEY")

# ====== Signup route ====== #
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        user = auth.create_user(email=email, password=password)
        return jsonify({"message": "User created successfully", "uid": user.uid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ===== Login route ====== #
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Firebase REST API endpoint for login
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        response = requests.post(url, json=payload)
        result = response.json()

        if "error" in result:
            return jsonify({"error": result["error"]["message"]}), 401

        # Save user UID in session
        user_info = auth.get_user(result["localId"])
        session["user"] = user_info.uid

        return jsonify({
            "message": "Login successful",
            "uid": user_info.uid,
            "idToken": result["idToken"]  # Optional: can be sent to frontend
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ===== Profile route (protected) ====== #
@auth_bp.route("/profile", methods=["GET"])
def profile():
    if "user" not in session:
        return jsonify({"error": "Not logged in"}), 401
    try:
        user = auth.get_user(session["user"])
        return jsonify({
            "uid": user.uid,
            "email": user.email,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ===== Logout route ====== #
@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return jsonify({"message": "Logged out successfully"}), 200