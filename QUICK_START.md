# 🚀 FINAL SETUP GUIDE - Ready for Tomorrow!

## Step 1: Backend Setup (5 minutes)

### 1.1 Create serviceAccountKey.json
Create file: `backend/serviceAccountKey.json` with this content:
```json
{
  "type": "service_account",
  "project_id": "auth-backend-7",
  "private_key_id": "d54e54ec4dd3216f189a764a704b98603ed8cedd",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
  "client_email": "firebase-adminsdk-fbsvc@auth-backend-7.iam.gserviceaccount.com",
  ...
}
```
(Use the JSON your friend sent you)

### 1.2 Set Environment Variable
```powershell
# Option 1: Set for current session
$env:FLASK_SECRET_KEY = "your-secret-key-here"

# Option 2: Create .env file (recommended)
# Create backend/.env with:
# FLASK_SECRET_KEY=your-secret-key-here
```

### 1.3 Copy Database Folders
According to your friend's instructions:
```powershell
cd backend
# Copy these folders to backend/databases/:
# - chroma_icd folder
# - database files (pre_auth.db, etc.)
```

### 1.4 Install Python Packages
```powershell
cd backend
pip install -r requirements.txt
```

### 1.5 Start Backend Server
```powershell
cd backend
python -m src.server
```

You should see: `✅ Firebase Admin initialized successfully.`

---

## Step 2: Frontend Setup (2 minutes)

### 2.1 Install Packages (if not done)
```powershell
npm install
```

### 2.2 Start Frontend
```powershell
npm run dev
```

You should see: `Local: http://localhost:5173`

---

## Step 3: Test Everything

1. Open browser: http://localhost:5173
2. Click "Doctor Portal" 
3. Try to register/login
4. Check browser DevTools (F12) → Network tab
5. You should see API calls to `/api/auth/login` working

---

## 🐛 Quick Fixes

### If backend won't start:
```powershell
# Check if Flask is installed
pip list | findstr flask

# If not, install it
pip install flask flask-sqlalchemy firebase-admin

# Make sure you're in backend folder
cd backend
python -m src.server
```

### If "Module not found" error:
```powershell
# Install missing package
pip install <package-name>

# Or reinstall all
pip install -r requirements.txt
```

### If Firebase error:
- Make sure `serviceAccountKey.json` is in `backend/` folder
- Check the JSON is valid (no extra commas, proper format)

### If port 5000 in use:
```powershell
# Find what's using it
netstat -ano | findstr :5000

# Kill it (replace <PID> with actual number)
taskkill /PID <PID> /F
```

---

## 📋 Presentation Checklist

Before presenting:
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Doctor login/register works
- [ ] Patient form loads
- [ ] No errors in browser console

---

## 🎯 Quick Commands

Start everything in 2 commands:

**Terminal 1 - Backend:**
```powershell
cd backend
python -m src.server
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

---

## 📝 What Your Friend Did

Your friend:
1. Created a Flask backend with Firebase authentication
2. Added database setup (SQLite + ChromaDB for ICD codes)
3. Created API routes for auth, forms, PDF processing, and LLM
4. Set up the serviceAccountKey.json for Firebase
5. Told you to copy the database folders he created

**The connection works like this:**
```
Frontend (React on :5173) 
    → makes request to /api/auth/login
    → Vite proxy forwards to http://localhost:5000/auth/login
    → Flask backend processes it
    → Returns response
```

---

Good luck tomorrow! 🎉
