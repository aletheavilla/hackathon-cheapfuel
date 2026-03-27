# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CheapFuel is a location-based gas station finder. Users search by location, and the app returns nearby stations sorted by price/distance/time. Prices combine DOE baseline data with community-submitted updates. GPT-4 powers an AI recommendation feature.

## Development Commands

### Backend (Flask)
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python app.py              # Runs on http://localhost:5000
```

### Frontend (React)
```bash
cd frontend
npm install
npm start                  # Runs on http://localhost:3000
npm test                   # Run tests
npm run build              # Production build
```

### Run both servers
```bash
./run.sh                   # Starts backend + frontend in parallel
./setup.sh                 # One-time setup (creates venvs, installs deps)
```

### Code formatting
```bash
cd frontend && npx prettier --write "src/**/*.{js,css}"
cd backend && python -m black app.py
```

## Architecture

**Stack**: React 18 SPA + Flask REST API + SQLite (dev) / PostgreSQL (prod)

### Frontend (`frontend/src/`)
- **`services/api.js`**: Axios client — all API calls go through here. Sets `Authorization: Bearer <token>` header from localStorage.
- **`components/Dashboard.js`**: Main search UI. Calls `/api/stations/search`, renders station cards with price/distance/ETA.
- **`components/AddressAutocomplete.js`**: Wraps Google Maps Places Autocomplete API.

### Backend (`backend/app.py`)
Single-file Flask app with three tiers of logic:
1. **Auth routes** (`/register`, `/login`, `/profile`): JWT-based auth via PyJWT + Werkzeug password hashing.
2. **Station routes** (`/stations/search`, `/stations/:id/price`, `/stations/:id/navigate`): Core business logic — calls Google Places API, Google Distance Matrix API, aggregates price data.
3. **ML route** (`/stations/recommendation`): Passes user context + station data to OpenAI GPT-4.

### Key Data Flow (station search)
1. Frontend POSTs coordinates + fuel type to `/api/stations/search`
2. Backend calls Google Places API for nearby gas stations
3. For each station: queries SQLite for latest price (user update < 7 days → DOE baseline fallback)
4. Calls Google Distance Matrix API for live traffic estimates
5. Sorts by requested priority (price/time/distance), returns JSON array

### Database Models (SQLAlchemy, in `app.py`)
- `User`: auth info + vehicle/fuel preferences
- `GasStation`: place_id (Google), coordinates, brand
- `PriceUpdate`: price, fuel_type, source (DOE/USER), timestamp — latest entry per station wins

## Environment Variables

**`backend/.env`**:
```
GOOGLE_MAPS_API_KEY=...
SECRET_KEY=...
OPEN_API_KEY=...
```

**`frontend/.env`**:
```
REACT_APP_GOOGLE_MAPS_API_KEY=...
REACT_APP_API_URL=http://localhost:8080
```

The frontend proxies API calls to `http://localhost:8080` (set in `frontend/package.json` `proxy` field). The backend runs on port 5000 in dev — adjust `REACT_APP_API_URL` or the proxy if port differs.

## External API Dependencies
- **Google Maps**: Places (station search), Geocoding (address→coords), Distance Matrix (ETA)
- **OpenAI GPT-4**: Used only in `/stations/recommendation` endpoint
