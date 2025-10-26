# 🚗 CheapFuel - Find Cheap Gas Stations

CheapFuel helps drivers instantly find and navigate to the cheapest and nearest gas stations for their preferred fuel type, combining DOE baseline data with user-submitted prices for real-time accuracy.

## ✨ Key Features

- 🔍 **Real-time gas station search** based on your location
- 📍 **Smart address input** with Google Maps autocomplete - only validated addresses accepted
- 💰 **Smart filtering** by cheapest price, fastest arrival, or shortest distance
- ⛽ **Multiple fuel types** (Regular, Premium, Diesel)
- 🗺️ **Google Maps integration** for live traffic routing
- 👥 **Community pricing** - DOE baseline + user updates
- 📱 **Mobile-responsive** design
- 🤖 **AI-powered recommendations** using GPT-4

## 🚀 Quick Start

### 1. Run Setup

```bash
./setup.sh
```

### 2. Get Google Maps API Key

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable: **Maps JavaScript API**, **Places API**, **Geocoding API**, **Distance Matrix API**, **Maps Embed API**
3. Create an API key
4. See [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) for detailed instructions

### 3. Configure Environment Variables

**Backend** - Create `backend/.env`:

```env
GOOGLE_MAPS_API_KEY=your_key_here
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key-here  # Optional, for GPT-4 recommendations
```

**Frontend** - Create `frontend/.env`:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
```

### 4. Run the App

```bash
./run.sh
```

Or manually:

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

Visit: **http://localhost:3000**

## 📚 Documentation

- **[GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)** - Google Maps address autocomplete setup
- **[CHEAPFUEL_README.md](./CHEAPFUEL_README.md)** - Complete documentation
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick reference guide
- **[GPT4_RECOMMENDATION_FEATURE.md](./GPT4_RECOMMENDATION_FEATURE.md)** - AI recommendations guide

## 🏗️ Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Flask, SQLAlchemy, JWT
- **Database**: SQLite
- **APIs**: Google Maps (Geocoding, Places, Distance Matrix)

## 📁 Project Structure

```
hackathon/
├── backend/          # Flask REST API
│   ├── app.py
│   └── requirements.txt
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   └── package.json
├── setup.sh          # Setup script
├── run.sh            # Run script
└── README.md         # This file
```

## 🎯 MVP Scope (Completed)

✅ Search nearby gas stations  
✅ Filter by fuel type  
✅ Show price, distance, and travel time  
✅ Prioritize by price, time, or distance  
✅ Display optimal route with live traffic  
✅ User registration with car and fuel preferences  
✅ Navigate to stations via Google Maps  
✅ Report price updates

## 🔮 Future Features

- Fuel consumption tracking
- Station promo alerts
- Predictive price trends
- Rewards for verified price submissions

## 📸 Screenshots

### Login/Registration

Clean, modern authentication flow with car model and fuel type setup.

### Dashboard

Search and filter gas stations with real-time prices, showing:

- Price per liter with source (DOE/User)
- Distance and estimated drive time
- Google ratings
- One-click navigation

### Profile Management

Update personal details, car model, and fuel preferences.

## 🛠️ Development

### Backend API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/stations/search` - Search stations
- `POST /api/stations/:id/price` - Update price
- `GET /api/stations/:id/navigate` - Get navigation URL
- `POST /api/stations/recommendation` - Get GPT-4 recommendation
- `POST /api/geocode` - Geocode and validate address

### Database Schema

- **Users**: email, name, car_model, fuel_type
- **GasStations**: place_id, name, address, lat/lng
- **PriceUpdates**: station, fuel_type, price, source (DOE/USER)

## 🐛 Troubleshooting

**No stations found?**

- Check Google Maps API key
- Enable required APIs in Google Cloud Console
- Allow location permissions in browser

**Backend errors?**

- Verify .env file configuration
- Check API quota in Google Cloud Console

**Frontend not connecting?**

- Ensure backend is running on port 5000
- Check REACT_APP_API_URL in frontend/.env

## 📄 License

MIT License

## 🤝 Contributing

Built for a hackathon - contributions welcome!

---

**Made with ❤️ to help drivers save money on fuel**
