# CheapFuel System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICE                             │
│  ┌───────────────────────────────────────────────────────┐     │
│  │                   React Frontend                       │     │
│  │                 (localhost:3000)                       │     │
│  │                                                        │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │     │
│  │  │  Login   │  │ Register │  │ Profile  │           │     │
│  │  └──────────┘  └──────────┘  └──────────┘           │     │
│  │                                                        │     │
│  │  ┌────────────────────────────────────────────────┐  │     │
│  │  │          Dashboard (Main App)                  │  │     │
│  │  │                                                │  │     │
│  │  │  • Location Service                           │  │     │
│  │  │  • Station Search                             │  │     │
│  │  │  • Fuel Type Filter                           │  │     │
│  │  │  • Priority Toggle (Price/Time/Distance)      │  │     │
│  │  │  • Station List Display                       │  │     │
│  │  │  • Navigation Integration                     │  │     │
│  │  │  • Price Update Modal                         │  │     │
│  │  └────────────────────────────────────────────────┘  │     │
│  │                                                        │     │
│  │  API Service (Axios)                                  │     │
│  │  • JWT Token Management                               │     │
│  │  • Request/Response Handling                          │     │
│  └───────────────────┬────────────────────────────────────┘     │
└────────────────────────┼──────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │ (JSON)
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                   Flask Backend API                            │
│                   (localhost:5000)                             │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              API Endpoints                            │    │
│  │                                                       │    │
│  │  Authentication:                                      │    │
│  │  • POST /api/register                                │    │
│  │  • POST /api/login                                   │    │
│  │  • GET  /api/profile                                 │    │
│  │  • PUT  /api/profile                                 │    │
│  │                                                       │    │
│  │  Gas Stations:                                        │    │
│  │  • POST /api/stations/search                         │    │
│  │  • POST /api/stations/:id/price                      │    │
│  │  • GET  /api/stations/:id/navigate                   │    │
│  │                                                       │    │
│  │  Admin:                                               │    │
│  │  • POST /api/admin/seed-prices                       │    │
│  └───────────────────┬──────────────────────────────────┘    │
│                      │                                         │
│  ┌──────────────────┴──────────────────────────────────┐     │
│  │         Business Logic Layer                         │     │
│  │                                                       │     │
│  │  • JWT Authentication                                │     │
│  │  • Password Hashing                                  │     │
│  │  • Location Processing                               │     │
│  │  • Distance Calculation                              │     │
│  │  • Price Logic (DOE vs User)                         │     │
│  │  • Station Sorting/Filtering                         │     │
│  └───────────────────┬──────────────────────────────────┘     │
│                      │                                         │
│  ┌──────────────────▼──────────────────────────────────┐     │
│  │           SQLAlchemy ORM                             │     │
│  └───────────────────┬──────────────────────────────────┘     │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  SQLite Database                             │
│                  (cheapfuel.db)                              │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │    Users       │  │  GasStations   │  │ PriceUpdates │ │
│  ├────────────────┤  ├────────────────┤  ├──────────────┤ │
│  │ id             │  │ id             │  │ id           │ │
│  │ email          │  │ place_id       │  │ station_id   │ │
│  │ password_hash  │  │ name           │  │ fuel_type    │ │
│  │ name           │  │ address        │  │ price        │ │
│  │ car_model      │  │ latitude       │  │ source       │ │
│  │ fuel_type      │  │ longitude      │  │ user_id      │ │
│  │ created_at     │  │ brand          │  │ updated_at   │ │
│  └────────────────┘  │ created_at     │  │ verified     │ │
│                      └────────────────┘  └──────────────┘ │
└──────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Google Maps Platform APIs                     │  │
│  │                                                       │  │
│  │  1. Geocoding API                                    │  │
│  │     • Location → Coordinates                         │  │
│  │                                                       │  │
│  │  2. Places API (Nearby Search)                       │  │
│  │     • Find gas stations                              │  │
│  │     • Station details                                │  │
│  │     • Ratings & reviews                              │  │
│  │                                                       │  │
│  │  3. Distance Matrix API                              │  │
│  │     • Calculate distance                             │  │
│  │     • Estimate duration                              │  │
│  │     • Consider live traffic                          │  │
│  │                                                       │  │
│  │  4. Maps JavaScript API (via URL)                    │  │
│  │     • Navigation/Directions                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ▲                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ API Key
                            │
        ┌───────────────────┴─────────────────┐
        │   Backend makes API calls            │
        │   (credentials stored in .env)       │
        └──────────────────────────────────────┘


DATA FLOW EXAMPLE - Searching for Gas Stations:
═══════════════════════════════════════════════

1. User opens Dashboard
   └─> Frontend requests GPS location

2. User clicks search
   └─> Frontend sends: POST /api/stations/search
       {
         "latitude": 14.5995,
         "longitude": 120.9842,
         "fuel_type": "Regular",
         "priority": "price"
       }

3. Backend receives request
   └─> Validates JWT token
   └─> Calls Google Places API with coordinates
   └─> Receives list of gas stations

4. For each station:
   └─> Check if exists in database (by place_id)
   └─> If new, insert into GasStations table
   └─> Query latest price from PriceUpdates
       • Prefer USER source (if < 7 days old)
       • Fall back to DOE source
   └─> Call Distance Matrix API for distance & duration
   └─> Build response object

5. Backend sorts results by priority
   └─> price: lowest first
   └─> time: fastest arrival first
   └─> distance: nearest first

6. Backend returns JSON array
   └─> Frontend displays station cards
   └─> User sees prices, distances, ETAs

7. User clicks "Navigate"
   └─> Frontend: GET /api/stations/123/navigate
   └─> Backend returns Google Maps URL
   └─> Opens in new tab with directions


AUTHENTICATION FLOW:
═══════════════════

1. User registers/logs in
   └─> Frontend: POST /api/register or /api/login

2. Backend:
   └─> Hash password (Werkzeug)
   └─> Store in database
   └─> Generate JWT token (expires in 30 days)
   └─> Return token + user object

3. Frontend:
   └─> Store token in localStorage
   └─> Store user object in localStorage
   └─> Include token in all subsequent requests

4. Protected requests:
   └─> Frontend adds: Authorization: Bearer <token>
   └─> Backend validates token
   └─> If valid: process request
   └─> If invalid: return 401 Unauthorized


PRICE UPDATE FLOW:
═════════════════

1. User sees station with DOE price (₱55.50)

2. User clicks "Update Price"
   └─> Modal appears

3. User enters new price (₱56.75)
   └─> Frontend: POST /api/stations/123/price
       {
         "fuel_type": "Regular",
         "price": 56.75
       }

4. Backend:
   └─> Validates token (get user_id)
   └─> Creates new PriceUpdate record
       • source = "USER"
       • user_id = authenticated user
       • updated_at = now
   └─> Saves to database

5. Backend responds with success

6. Frontend refreshes station list
   └─> New search fetches updated price
   └─> Badge now shows "User Updated" (green)
   └─> Price shows ₱56.75


DEPLOYMENT ARCHITECTURE (Future):
═════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│  Frontend (Vercel/Netlify)                              │
│  • Static React build                                   │
│  • CDN distribution                                     │
│  • Environment: REACT_APP_API_URL                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTPS
                   │
┌──────────────────▼──────────────────────────────────────┐
│  Backend (Heroku/Railway/DigitalOcean)                  │
│  • Flask app with Gunicorn                              │
│  • Environment variables:                               │
│    - GOOGLE_MAPS_API_KEY                                │
│    - SECRET_KEY                                         │
│    - DATABASE_URL                                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │
┌──────────────────▼──────────────────────────────────────┐
│  Database (PostgreSQL)                                  │
│  • Managed service (e.g., Heroku Postgres)              │
│  • Connection pooling                                   │
│  • Automatic backups                                    │
└─────────────────────────────────────────────────────────┘
```

## Technology Choices Explained

### Why Flask?

- Lightweight and fast
- Great for APIs
- Easy to understand and extend
- Extensive ecosystem

### Why React?

- Component-based architecture
- Fast rendering with Virtual DOM
- Huge community and resources
- Easy to make responsive

### Why SQLite (dev) / PostgreSQL (prod)?

- SQLite: Zero configuration, perfect for development
- PostgreSQL: Production-ready, ACID compliant, scalable

### Why JWT?

- Stateless authentication
- Works across multiple devices
- No server-side sessions needed
- Industry standard

### Why Google Maps?

- Most comprehensive location data
- Reliable traffic information
- Familiar to users
- Well-documented APIs

## Performance Optimizations

1. **Database Queries**
   - Index on place_id for fast lookups
   - Index on station_id + fuel_type for price queries
   - Single query to get latest prices

2. **API Calls**
   - Cache Google Maps results in database
   - Reuse station data (only fetch once)
   - Pagination support for large result sets

3. **Frontend**
   - Only re-search when filters change
   - Lazy load components
   - Optimized CSS (no heavy frameworks)

4. **Future**
   - Redis caching layer
   - WebSocket for real-time updates
   - Service worker for offline support
   - Image optimization for station logos

## Security Considerations

1. **Password Security**
   - Hashed with Werkzeug (PBKDF2)
   - Never stored in plain text
   - Minimum 6 characters enforced

2. **API Security**
   - JWT tokens with expiration
   - CORS configured properly
   - Environment variables for secrets
   - Input validation on all endpoints

3. **Database Security**
   - Parameterized queries (SQLAlchemy)
   - Foreign key constraints
   - No direct SQL injection risk

4. **Future Enhancements**
   - Rate limiting
   - HTTPS enforcement
   - CAPTCHA on registration
   - Email verification
   - Two-factor authentication

## Scalability Path

### Current (MVP)

- Single server
- SQLite database
- ~100 concurrent users
- ~1000 stations

### Phase 2 (Growth)

- Multiple backend instances
- PostgreSQL database
- Redis caching
- ~10,000 concurrent users
- ~100,000 stations

### Phase 3 (Scale)

- Kubernetes orchestration
- Database sharding
- CDN for frontend
- Elasticsearch for search
- ~100,000+ concurrent users
- Millions of stations
