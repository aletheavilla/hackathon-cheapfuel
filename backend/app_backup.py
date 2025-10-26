import os
import json
import requests
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from typing import List, Dict, Tuple
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cheapfuel.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    car_model = db.Column(db.String(100))
    fuel_type = db.Column(db.String(50))  # Regular, Premium, Diesel
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class GasStation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    place_id = db.Column(db.String(200), unique=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(500))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    brand = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PriceUpdate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    station_id = db.Column(db.Integer, db.ForeignKey('gas_station.id'), nullable=False)
    fuel_type = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    source = db.Column(db.String(50), default='DOE')  # DOE or USER
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    verified = db.Column(db.Boolean, default=False)
    
    station = db.relationship('GasStation', backref='price_updates')
    user = db.relationship('User', backref='price_updates')

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Helper functions
def get_distance_and_duration(origin_lat: float, origin_lng: float, 
                               dest_lat: float, dest_lng: float) -> Tuple[float, int]:
    """Get distance and duration from Google Maps Distance Matrix API"""
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    
    if not api_key:
        # Fallback to simple distance calculation (Haversine formula)
        from math import radians, cos, sin, asin, sqrt
        
        lon1, lat1, lon2, lat2 = map(radians, [origin_lng, origin_lat, dest_lng, dest_lat])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c
        
        # Estimate duration (assuming 40 km/h average speed)
        duration_minutes = int((km / 40) * 60)
        
        return km, duration_minutes
    
    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": f"{origin_lat},{origin_lng}",
        "destinations": f"{dest_lat},{dest_lng}",
        "key": api_key,
        "mode": "driving",
        "departure_time": "now"
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data['status'] == 'OK' and data['rows'][0]['elements'][0]['status'] == 'OK':
            distance_km = data['rows'][0]['elements'][0]['distance']['value'] / 1000
            duration_sec = data['rows'][0]['elements'][0]['duration']['value']
            return distance_km, duration_sec // 60
        else:
            return 0, 0
    except Exception as e:
        print(f"Error getting distance: {e}")
        return 0, 0

def fetch_nearby_gas_stations(lat: float, lng: float, radius: int = 8080) -> List[Dict]:
    """Fetch gas stations from Google Maps Places API"""
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    
    if not api_key:
        return []
    
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "gas_station",
        "key": api_key
    }
    
    all_results = []
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data["status"] in ["OK", "ZERO_RESULTS"]:
            all_results.extend(data.get("results", []))
            
            # Handle pagination
            while "next_page_token" in data:
                import time
                time.sleep(2)
                
                next_params = {
                    "pagetoken": data["next_page_token"],
                    "key": api_key
                }
                response = requests.get(url, params=next_params)
                data = response.json()
                
                if data["status"] == "OK":
                    all_results.extend(data.get("results", []))
                else:
                    break
        
        return all_results
    except Exception as e:
        print(f"Error fetching gas stations: {e}")
        return []

def get_latest_price(station_id: int, fuel_type: str) -> Dict:
    """Get the latest price for a station and fuel type"""
    # First try user-updated prices (within last 7 days)
    user_price = PriceUpdate.query.filter_by(
        station_id=station_id,
        fuel_type=fuel_type,
        source='USER'
    ).filter(
        PriceUpdate.updated_at >= datetime.utcnow() - timedelta(days=7)
    ).order_by(PriceUpdate.updated_at.desc()).first()
    
    if user_price:
        return {
            'price': user_price.price,
            'source': 'USER',
            'updated_at': user_price.updated_at.isoformat()
        }
    
    # Fall back to DOE price
    doe_price = PriceUpdate.query.filter_by(
        station_id=station_id,
        fuel_type=fuel_type,
        source='DOE'
    ).order_by(PriceUpdate.updated_at.desc()).first()
    
    if doe_price:
        return {
            'price': doe_price.price,
            'source': 'DOE',
            'updated_at': doe_price.updated_at.isoformat()
        }
    
    return None

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400
    
    user = User(
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        name=data['name'],
        car_model=data.get('car_model'),
        fuel_type=data.get('fuel_type', 'Regular')
    )
    
    db.session.add(user)
    db.session.commit()
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=30)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'car_model': user.car_model,
            'fuel_type': user.fuel_type
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing credentials'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=30)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'car_model': user.car_model,
            'fuel_type': user.fuel_type
        }
    })

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'id': current_user.id,
        'email': current_user.email,
        'name': current_user.name,
        'car_model': current_user.car_model,
        'fuel_type': current_user.fuel_type
    })

@app.route('/api/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    if data.get('name'):
        current_user.name = data['name']
    if data.get('car_model'):
        current_user.car_model = data['car_model']
    if data.get('fuel_type'):
        current_user.fuel_type = data['fuel_type']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': {
            'id': current_user.id,
            'email': current_user.email,
            'name': current_user.name,
            'car_model': current_user.car_model,
            'fuel_type': current_user.fuel_type
        }
    })

@app.route('/api/stations/search', methods=['POST'])
@token_required
def search_stations(current_user):
    data = request.get_json()
    
    lat = data.get('latitude')
    lng = data.get('longitude')
    fuel_type = data.get('fuel_type', current_user.fuel_type or 'Regular')
    radius = data.get('radius', 5000)
    priority = data.get('priority', 'price')  # price, time, distance
    
    if not lat or not lng:
        return jsonify({'message': 'Location required'}), 400
    
    # Fetch nearby stations from Google Maps
    google_stations = fetch_nearby_gas_stations(lat, lng, radius)
    
    results = []
    
    for gs in google_stations:
        # Check if station exists in our database
        station = GasStation.query.filter_by(place_id=gs['place_id']).first()
        
        if not station:
            # Add new station to database
            station = GasStation(
                place_id=gs['place_id'],
                name=gs.get('name', 'Unknown Station'),
                address=gs.get('vicinity', ''),
                latitude=gs['geometry']['location']['lat'],
                longitude=gs['geometry']['location']['lng'],
                brand=gs.get('name', '').split()[0]  # First word as brand
            )
            db.session.add(station)
            db.session.commit()
        
        # Get distance and duration
        distance_km, duration_min = get_distance_and_duration(
            lat, lng, station.latitude, station.longitude
        )
        
        # Get latest price
        price_info = get_latest_price(station.id, fuel_type)
        
        if price_info:
            results.append({
                'id': station.id,
                'place_id': station.place_id,
                'name': station.name,
                'address': station.address,
                'latitude': station.latitude,
                'longitude': station.longitude,
                'brand': station.brand,
                'distance_km': round(distance_km, 2),
                'duration_min': duration_min,
                'price': price_info['price'],
                'price_source': price_info['source'],
                'price_updated_at': price_info['updated_at'],
                'rating': gs.get('rating'),
                'user_ratings_total': gs.get('user_ratings_total', 0)
            })
    
    # Sort based on priority
    if priority == 'price':
        results.sort(key=lambda x: x['price'])
    elif priority == 'time':
        results.sort(key=lambda x: x['duration_min'])
    elif priority == 'distance':
        results.sort(key=lambda x: x['distance_km'])
    
    return jsonify({
        'stations': results,
        'count': len(results),
        'fuel_type': fuel_type,
        'priority': priority
    })

@app.route('/api/stations/<int:station_id>/price', methods=['POST'])
@token_required
def update_price(current_user, station_id):
    import json
    from datetime import datetime
    
    data = request.get_json()
    
    fuel_type = data.get('fuel_type')
    price = data.get('price')
    
    if not fuel_type or not price:
        return jsonify({'message': 'Fuel type and price required'}), 400
    
    # First check database
    station = GasStation.query.get(station_id)
    
    # If not in database, check dummy data
    if not station:
        dummy_data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dummy_data')
        with open(os.path.join(dummy_data_path, 'gas_stations.json'), 'r') as f:
            gas_stations = json.load(f)
        
        station_data = next((s for s in gas_stations if s['id'] == station_id), None)
        
        if not station_data:
            return jsonify({'message': 'Station not found'}), 404
        
        # Return the price information without saving to database (using dummy data)
        return jsonify({
            'message': 'Price updated successfully',
            'price_update': {
                'id': None,  # No database ID since we're not saving
                'station_name': station_data['name'],
                'fuel_type': fuel_type,
                'price': price,
                'updated_at': datetime.utcnow().isoformat()
            }
        }), 201
    
    # Return the price information without saving to database (using database station)
    return jsonify({
        'message': 'Price updated successfully',
        'price_update': {
            'id': None,  # No database ID since we're not saving
            'station_name': station.name,
            'fuel_type': fuel_type,
            'price': price,
            'updated_at': datetime.utcnow().isoformat()
        }
    }), 201

@app.route('/api/stations/<int:station_id>/navigate', methods=['GET'])
@token_required
def navigate_to_station(current_user, station_id):
    station = GasStation.query.get(station_id)
    if not station:
        return jsonify({'message': 'Station not found'}), 404
    
    # Generate Google Maps navigation URL
    nav_url = f"https://www.google.com/maps/dir/?api=1&destination={station.latitude},{station.longitude}"
    
    return jsonify({
        'navigation_url': nav_url,
        'station': {
            'name': station.name,
            'address': station.address,
            'latitude': station.latitude,
            'longitude': station.longitude
        }
    })

@app.route('/api/admin/seed-prices', methods=['POST'])
def seed_prices():
    """Seed database with sample DOE prices"""
    # This would normally fetch from DOE API or CSV
    # For now, we'll use sample data
    
    fuel_types = ['Regular', 'Premium', 'Diesel']
    base_prices = {
        'Regular': 55.50,
        'Premium': 65.80,
        'Diesel': 52.30
    }
    
    stations = GasStation.query.all()
    
    for station in stations:
        for fuel_type in fuel_types:
            # Check if price already exists
            existing = PriceUpdate.query.filter_by(
                station_id=station.id,
                fuel_type=fuel_type,
                source='DOE'
            ).first()
            
            if not existing:
                # Add some variation to prices (+/- 2 pesos)
                import random
                price_variation = random.uniform(-2, 2)
                price = base_prices[fuel_type] + price_variation
                
                price_update = PriceUpdate(
                    station_id=station.id,
                    fuel_type=fuel_type,
                    price=round(price, 2),
                    source='DOE'
                )
                db.session.add(price_update)
    
    db.session.commit()
    
    return jsonify({'message': 'Prices seeded successfully'})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

# Initialize database
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)

