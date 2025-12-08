# 🎯 HOW TO RUN THE BACKEND - SUPER SIMPLE!

## ✅ Packages Already Installed:
- flask ✓
- flask-sqlalchemy ✓
- flask-cors ✓  
- firebase-admin ✓
- pypdf ✓
- requests ✓

---

## 🚀 TO RUN BACKEND (Copy & Paste This):

### Open PowerShell/Terminal in project root and run:

```powershell
cd backend
python -m src.server
```

**That's it!** 

You should see:
```
✅ Firebase Admin initialized successfully.
✅ Database ready.
* Running on http://127.0.0.1:5000
```

---

## 🌐 TO RUN FRONTEND (Open NEW terminal):

```powershell
npm run dev
```

You should see:
```
Local: http://localhost:5173
```

---

## ✅ TEST IF IT WORKS:

1. Backend running → See "Running on http://127.0.0.1:5000"
2. Frontend running → Open http://localhost:5173
3. Click "Doctor Portal" → Try register
4. Press F12 → Network tab → See API call successful

---

## 🐛 IF YOU SEE ERROR "Module not found":

```powershell
# Install the missing module:
pip install <module-name>

# Example:
pip install pypdf
pip install requests
```

---

## 📋 QUICK CHECKLIST:

Before running:
- [ ] In `backend/` folder
- [ ] Run: `python -m src.server`
- [ ] See "Running on http://127.0.0.1:5000"
- [ ] Open NEW terminal for frontend
- [ ] Run: `npm run dev`
- [ ] Open: http://localhost:5173

---

## 🎯 FOR TOMORROW'S PRESENTATION:

### 5 minutes before:
```powershell
# Terminal 1
cd backend
python -m src.server

# Terminal 2 (new terminal)
npm run dev
```

Keep both terminals open!

---

**You're ready!** Just run those 2 commands and you're good to go! 🚀
