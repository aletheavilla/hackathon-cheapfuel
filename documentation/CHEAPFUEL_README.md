# 🚗 CheapFuel

**CheapFuel** is a web application that helps users find the cheapest and nearest gas stations for their preferred fuel type. It combines DOE (Department of Energy) baseline data with user-submitted price updates for real-time accuracy.

## 🎯 Features

### Core Features (MVP)

- **Real-time gas station search** based on user location
- **Filter by fuel type** (Regular, Premium, Diesel)
- **Prioritize results** by:
  - 💰 Cheapest price
  - ⚡ Fastest arrival time
  - 📍 Shortest distance
- **Live traffic routing** using Google Maps
- **User accounts** with car model and fuel type preferences
- **Price updates** - Users can report current prices
- **DOE baseline prices** with visual distinction from user-submitted prices
- **Google Maps navigation** integration

### Future Features (Roadmap)

- Fuel consumption tracking
- Station promo alerts
- Price trend predictions
- Rewards for verified price submissions

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React (mobile-responsive SPA)
- **Backend**: Flask (Python REST API)
- **Database**: SQLite (can be upgraded to PostgreSQL)
- **APIs**: Google Maps (Geocoding, Places, Distance Matrix)
- **Authentication**: JWT tokens

### Project Structure

```
hackathon/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   └── Profile.js
│   │   ├── services/       # API integration
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── .gitignore
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google Maps API Key

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Geocoding API**
   - **Places API**
   - **Distance Matrix API**
4. Create credentials (API Key)
5. (Optional) Restrict your API key to these services

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Google Maps API key
# GOOGLE_MAPS_API_KEY=your_actual_api_key_here
# SECRET_KEY=your-secret-key-for-jwt

# Run the backend server
python app.py
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# The .env file should already exist with:
# REACT_APP_API_URL=http://localhost:5000/api

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

## 📱 Usage

### First Time Setup

1. Open the app at `http://localhost:3000`
2. Click "Sign Up" to create an account
3. Enter your details:
   - Name
   - Email
   - Password
   - Car model (optional)
   - Preferred fuel type
4. You'll be automatically logged in

### Finding Gas Stations

1. The app will request your location (allow permission)
2. Select your fuel type (Regular, Premium, Diesel)
3. Choose your priority:
   - **Cheapest Price**: Shows lowest prices first
   - **Fastest Arrival**: Optimized for quickest drive time
   - **Shortest Distance**: Nearest stations first
4. Browse the list of gas stations with:
   - Name and address
   - Price per liter
   - Distance and estimated drive time
   - Price source (DOE baseline or User updated)
   - Google ratings

### Navigation

1. Click "🗺️ Navigate" on any station card
2. Opens Google Maps with turn-by-turn directions

### Updating Prices

1. Click "💵 Update Price" on any station
2. Enter the current price you observed
3. Submit to help other users

### Managing Profile

1. Click "Profile" in the header
2. Update your name, car model, or fuel preference
3. Save changes

## 🔐 API Endpoints

### Authentication

- `POST /api/register` - Create new user account
- `POST /api/login` - Login and get JWT token
- `GET /api/profile` - Get current user profile (authenticated)
- `PUT /api/profile` - Update user profile (authenticated)

### Gas Stations

- `POST /api/stations/search` - Search nearby gas stations (authenticated)
  ```json
  {
    "latitude": 14.5995,
    "longitude": 120.9842,
    "fuel_type": "Regular",
    "priority": "price",
    "radius": 5000
  }
  ```
- `POST /api/stations/:id/price` - Update station price (authenticated)
- `GET /api/stations/:id/navigate` - Get navigation URL (authenticated)

### Admin

- `POST /api/admin/seed-prices` - Seed database with sample DOE prices

## 🗄️ Database Schema

### Users

- id (Primary Key)
- email (Unique)
- password_hash
- name
- car_model
- fuel_type
- created_at

### GasStations

- id (Primary Key)
- place_id (Unique, from Google Maps)
- name
- address
- latitude
- longitude
- brand
- created_at

### PriceUpdates

- id (Primary Key)
- station_id (Foreign Key)
- fuel_type
- price
- source (DOE or USER)
- user_id (Foreign Key, nullable)
- updated_at
- verified

## 🎨 Design Philosophy

- **Mobile-First**: Responsive design that works on all devices
- **Modern UI**: Clean, intuitive interface with clear visual hierarchy
- **Real-Time**: Live traffic data and user-submitted prices
- **User-Friendly**: Minimal clicks to find and navigate to stations
- **Transparent**: Clear distinction between DOE and user prices

## 🐛 Troubleshooting

### "No gas stations found"

- Check if Google Maps API key is properly set
- Ensure Places API is enabled in Google Cloud Console
- Verify location permissions in browser

### Backend errors

- Make sure all required APIs are enabled in Google Cloud
- Check .env file has correct API key
- Verify database file has write permissions

### Frontend not connecting to backend

- Ensure backend is running on port 5000
- Check REACT_APP_API_URL in frontend/.env
- Look for CORS errors in browser console

## 📄 License

MIT License - feel free to use this for your own projects!

## 🤝 Contributing

This is a hackathon project, but contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## 🙏 Acknowledgments

- DOE Philippines for baseline fuel price data
- Google Maps API for location and routing services
- React and Flask communities for excellent documentation

---

**Built with ❤️ for drivers who want to save money on fuel!**
