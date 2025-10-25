# CheapFuel - Quick Start Guide

## 🚀 Running the Application

### Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate  # or create venv if it doesn't exist
pip install -r requirements.txt
python app.py
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm start
```

### Environment Setup
Make sure you have a `.env` file in the backend directory with:
```
GOOGLE_MAPS_API_KEY=your_key_here
SECRET_KEY=your-secret-key
```

### First Time Database Setup
The database will be created automatically when you run the backend.

To seed with sample prices:
```bash
curl -X POST http://localhost:5000/api/admin/seed-prices
```

## 📝 Test Accounts
After running the app, create an account through the registration page.

## 🔧 Development Notes
- Backend runs on http://localhost:5000
- Frontend runs on http://localhost:3000
- Database file: backend/cheapfuel.db
- Location services must be enabled in browser

