# CheapFuel API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All endpoints (except `/register`, `/login`, and `/health`) require JWT authentication.

Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Health Check

#### `GET /api/health`

Check if the API is running.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T12:00:00.000000"
}
```

---

### Authentication Endpoints

#### `POST /api/register`

Create a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "car_model": "Toyota Corolla",
  "fuel_type": "Regular"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "car_model": "Toyota Corolla",
    "fuel_type": "Regular"
  }
}
```

**Errors:**

- `400` - Missing required fields
- `400` - Email already registered

---

#### `POST /api/login`

Login with existing credentials.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "car_model": "Toyota Corolla",
    "fuel_type": "Regular"
  }
}
```

**Errors:**

- `400` - Missing credentials
- `401` - Invalid credentials

---

### User Profile Endpoints

#### `GET /api/profile`

Get current user's profile. Requires authentication.

**Response (200):**

```json
{
  "id": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "car_model": "Toyota Corolla",
  "fuel_type": "Regular"
}
```

**Errors:**

- `401` - Token missing or invalid

---

#### `PUT /api/profile`

Update current user's profile. Requires authentication.

**Request Body:**

```json
{
  "name": "John Smith",
  "car_model": "Honda Civic",
  "fuel_type": "Premium"
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Smith",
    "car_model": "Honda Civic",
    "fuel_type": "Premium"
  }
}
```

**Errors:**

- `401` - Token missing or invalid

---

### Gas Station Endpoints

#### `POST /api/stations/search`

Search for nearby gas stations. Requires authentication.

**Request Body:**

```json
{
  "latitude": 14.5995,
  "longitude": 120.9842,
  "fuel_type": "Regular",
  "priority": "price",
  "radius": 5000
}
```

**Parameters:**

- `latitude` (required): User's latitude
- `longitude` (required): User's longitude
- `fuel_type` (optional): "Regular", "Premium", or "Diesel" (defaults to user's preference)
- `priority` (optional): "price", "time", or "distance" (default: "price")
- `radius` (optional): Search radius in meters (default: 5000)

**Response (200):**

```json
{
  "stations": [
    {
      "id": 1,
      "place_id": "ChIJ...",
      "name": "Shell Gas Station",
      "address": "123 Main St, Makati City",
      "latitude": 14.55,
      "longitude": 121.03,
      "brand": "Shell",
      "distance_km": 2.5,
      "duration_min": 8,
      "price": 55.5,
      "price_source": "DOE",
      "price_updated_at": "2025-10-25T06:00:00.000000",
      "rating": 4.5,
      "user_ratings_total": 120
    }
  ],
  "count": 1,
  "fuel_type": "Regular",
  "priority": "price"
}
```

**Errors:**

- `400` - Location required
- `401` - Token missing or invalid

---

#### `POST /api/stations/:id/price`

Update the price for a gas station. Requires authentication.

**URL Parameters:**

- `id`: Station ID

**Request Body:**

```json
{
  "fuel_type": "Regular",
  "price": 56.75
}
```

**Response (201):**

```json
{
  "message": "Price updated successfully",
  "price_update": {
    "id": 10,
    "station_name": "Shell Gas Station",
    "fuel_type": "Regular",
    "price": 56.75,
    "updated_at": "2025-10-25T12:30:00.000000"
  }
}
```

**Errors:**

- `400` - Fuel type and price required
- `401` - Token missing or invalid
- `404` - Station not found

---

#### `GET /api/stations/:id/navigate`

Get navigation URL for a gas station. Requires authentication.

**URL Parameters:**

- `id`: Station ID

**Response (200):**

```json
{
  "navigation_url": "https://www.google.com/maps/dir/?api=1&destination=14.5500,121.0300",
  "station": {
    "name": "Shell Gas Station",
    "address": "123 Main St, Makati City",
    "latitude": 14.55,
    "longitude": 121.03
  }
}
```

**Errors:**

- `401` - Token missing or invalid
- `404` - Station not found

---

### Admin Endpoints

#### `POST /api/admin/seed-prices`

Seed the database with sample DOE baseline prices.

**Response (200):**

```json
{
  "message": "Prices seeded successfully"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Resource created
- `400` - Bad request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `404` - Resource not found
- `500` - Internal server error

---

## Fuel Types

Supported fuel types:

- `Regular` - Regular gasoline
- `Premium` - Premium gasoline
- `Diesel` - Diesel fuel

---

## Priority Options

When searching for stations:

- `price` - Sort by lowest price first
- `time` - Sort by fastest arrival time (considering traffic)
- `distance` - Sort by shortest distance

---

## Price Sources

Prices can come from two sources:

- `DOE` - Department of Energy baseline price (updated weekly)
- `USER` - Community-submitted price (valid for 7 days)

User-submitted prices take precedence over DOE prices when available.

---

## Rate Limiting

Google Maps API has usage limits. If you exceed them, you may receive:

- Limited results
- Fallback to basic distance calculations
- Error messages about API quota

---

## Testing with cURL

### Register a user:

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "fuel_type": "Regular"
  }'
```

### Login:

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Search stations (replace TOKEN):

```bash
curl -X POST http://localhost:5000/api/stations/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "latitude": 14.5995,
    "longitude": 120.9842,
    "fuel_type": "Regular",
    "priority": "price"
  }'
```

### Seed prices:

```bash
curl -X POST http://localhost:5000/api/admin/seed-prices
```
