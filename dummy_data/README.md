# Dummy Data for CheapFuel

This directory contains JSON dummy data files for testing and development purposes.

## Files

### 1. users.json
Contains 10 sample users with different car models and fuel preferences.

**Fields:**
- `id` - User ID (integer)
- `email` - User email address (string)
- `name` - User full name (string)
- `car_model` - User's car model (string, nullable)
- `fuel_type` - Preferred fuel type: "Regular", "Premium", or "Diesel" (string)
- `created_at` - Account creation timestamp (ISO 8601 datetime)

**Note:** Passwords are not included in the JSON as they should be hashed before storage.

### 2. gas_stations.json
Contains 20 sample gas stations across Metro Manila with realistic locations.

**Fields:**
- `id` - Station ID (integer)
- `place_id` - Google Places unique identifier (string)
- `name` - Station name (string)
- `address` - Station address (string)
- `latitude` - GPS latitude coordinate (float)
- `longitude` - GPS longitude coordinate (float)
- `brand` - Gas station brand (string) - Shell, Petron, Caltex, Seaoil, Phoenix
- `created_at` - Timestamp when station was added (ISO 8601 datetime)

**Brands included:**
- Shell (5 stations)
- Petron (5 stations)
- Caltex (3 stations)
- Seaoil (3 stations)
- Phoenix (4 stations)

**Location coverage:**
- Makati City
- Taguig City (BGC)
- Pasay City
- Quezon City
- Mandaluyong City
- Pasig City
- Paranaque City
- Muntinlupa City
- Manila
- Antipolo City

### 3. price_updates.json
Contains 70 price updates: 60 DOE prices (3 fuel types × 20 stations) + 10 user-submitted prices.

**Fields:**
- `id` - Update ID (integer)
- `station_id` - Foreign key to gas_station (integer)
- `fuel_type` - Type of fuel: "Regular", "Premium", or "Diesel" (string)
- `price` - Price per liter in Philippine Pesos (float)
- `source` - Price source: "DOE" or "USER" (string)
- `user_id` - Foreign key to user (integer, nullable - null for DOE prices)
- `updated_at` - Timestamp of the price update (ISO 8601 datetime)
- `verified` - Whether the price has been verified (boolean)

**Price ranges (realistic Philippine fuel prices as of Oct 2024):**
- Regular: ₱53.50 - ₱56.20 per liter
- Premium: ₱63.90 - ₱67.00 per liter
- Diesel: ₱50.30 - ₱53.10 per liter

**DOE Prices:** All dated 2024-10-20 08:00:00 (simulating weekly DOE update)
**User Prices:** Various timestamps on 2024-10-24 (more recent updates from community)

## Usage

These files can be used to:
1. Seed the development database
2. Test API endpoints
3. Demonstrate application functionality
4. Create realistic test scenarios

## Importing Data

To import this data into the SQLite database, you can create a script that reads these JSON files and inserts them into the respective tables using SQLAlchemy ORM.

Example:
```python
import json
from backend.app import app, db, User, GasStation, PriceUpdate
from werkzeug.security import generate_password_hash

with app.app_context():
    # Load users
    with open('dummy_data/users.json') as f:
        users = json.load(f)
        for user_data in users:
            user = User(
                id=user_data['id'],
                email=user_data['email'],
                password_hash=generate_password_hash('password123'),  # Default password
                name=user_data['name'],
                car_model=user_data.get('car_model'),
                fuel_type=user_data.get('fuel_type')
            )
            db.session.add(user)
    
    # Load gas stations
    with open('dummy_data/gas_stations.json') as f:
        stations = json.load(f)
        for station_data in stations:
            station = GasStation(**station_data)
            db.session.add(station)
    
    # Load price updates
    with open('dummy_data/price_updates.json') as f:
        prices = json.load(f)
        for price_data in prices:
            price = PriceUpdate(**price_data)
            db.session.add(price)
    
    db.session.commit()
```

## Notes

- All coordinates are real locations in Metro Manila
- Place IDs are sample/placeholder values (not real Google Place IDs)
- Prices reflect realistic Philippine fuel prices as of October 2024
- User passwords are not included; use a default password when importing
- Timestamps use ISO 8601 format for consistency

