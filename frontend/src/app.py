from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# Dummy storage (temporary)
users = {}        # { email: { password, name, address, ... } }
email_otps = {}
sos_data = []
danger_reports = []


# ✅ REGISTER USER
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if email in users:
        return jsonify({"error": "Email already exists"}), 409

    users[email] = {
        "email": email,
        "password": password,
        "name": data.get("name", ""),
        "address": data.get("address", ""),
        "contactNumber": data.get("contactNumber", ""),
        "emergencyContact1": data.get("emergencyContact1", ""),
        "emergencyContact2": data.get("emergencyContact2", ""),
    }

    print(f"✅ User registered: {email}")
    return jsonify({"message": "User registered successfully", "user": users[email]})


# ✅ LOGIN USER
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users.get(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["password"] != password:
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({"message": "Login successful", "user": user})


# ✅ DELETE ACCOUNT
@app.route('/api/delete-account', methods=['DELETE'])
def delete_account():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    if email not in users:
        return jsonify({"message": "User not found"}), 404

    del users[email]

    # Also clean up OTPs and SOS data for this user
    email_otps.pop(email, None)
    global sos_data
    sos_data = [s for s in sos_data if s.get("email") != email]

    print(f"🗑️ Account deleted: {email}")
    return jsonify({"message": "Account deleted successfully"}), 200


# ✅ UPDATE PROFILE
@app.route('/api/update-profile', methods=['PUT'])
def update_profile():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    if email not in users:
        return jsonify({"error": "User not found"}), 404

    updatable_fields = ["name", "address", "contactNumber", "emergencyContact1", "emergencyContact2"]
    for field in updatable_fields:
        if field in data:
            users[email][field] = data[field]

    print(f"✏️ Profile updated: {email}")
    return jsonify({"message": "Profile updated successfully", "user": users[email]})


# ✅ SEND EMAIL OTP
@app.route('/api/send-email-otp', methods=['POST'])
def send_email_otp():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    otp = str(random.randint(100000, 999999))
    email_otps[email] = otp

    print(f"📧 OTP for {email}: {otp}")

    return jsonify({"message": "OTP sent successfully", "otp": otp})


# ✅ VERIFY OTP
@app.route('/api/verify-email-otp', methods=['POST'])
def verify_email_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')

    if email_otps.get(email) == otp:
        return jsonify({"message": "OTP Verified"})
    else:
        return jsonify({"error": "Invalid OTP"}), 400


# ✅ SOS API
@app.route('/api/sos', methods=['POST'])
def sos():
    data = request.json
    sos_data.append(data)

    print("🚨 SOS RECEIVED:", data)

    return jsonify({"message": "SOS stored successfully"})


# ✅ REPORT DANGER
@app.route('/api/report', methods=['POST'])
def report():
    data = request.json
    danger_reports.append(data)

    print("⚠️ Danger Report:", data)

    return jsonify({"message": "Report submitted"})


# ✅ GET ALL DANGERS
@app.route('/api/dangers', methods=['GET'])
def get_dangers():
    return jsonify(danger_reports)


if __name__ == '__main__':
    app.run(debug=True)