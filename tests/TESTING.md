# CheapFuel Testing Guide

## Manual Testing Checklist

### 1. Backend Testing

#### Setup

```bash
cd backend
source venv/bin/activate
python app.py
```

Server should start on `http://localhost:5000`

#### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected: `{"status":"healthy","timestamp":"..."}`

#### Test User Registration

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Driver",
    "email": "driver@test.com",
    "password": "test123",
    "car_model": "Toyota Vios",
    "fuel_type": "Regular"
  }'
```

Expected: Returns token and user object

#### Test Login

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@test.com",
    "password": "test123"
  }'
```

Save the token from response for next steps.

#### Test Search (replace YOUR_TOKEN)

```bash
curl -X POST http://localhost:5000/api/stations/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "latitude": 14.5547,
    "longitude": 121.0244,
    "fuel_type": "Regular",
    "priority": "price"
  }'
```

#### Seed Sample Prices

```bash
curl -X POST http://localhost:5000/api/admin/seed-prices
```

---

### 2. Frontend Testing

#### Setup

```bash
cd frontend
npm start
```

App opens at `http://localhost:3000`

#### Test Registration Flow

1. Click "Sign Up"
2. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Car Model: "Honda Civic"
   - Fuel Type: "Premium"
3. Click "Create Account"
4. Should redirect to dashboard

#### Test Login Flow

1. Logout if logged in
2. Click "Sign In"
3. Enter credentials
4. Should redirect to dashboard

#### Test Station Search

1. Allow location permissions when prompted
2. Verify fuel type is set to your preference
3. Try each priority option:
   - 💰 Cheapest Price
   - ⚡ Fastest Arrival
   - 📍 Shortest Distance
4. Verify results update and re-sort

#### Test Station Details

For each station card, verify:

- Station name displays
- Address shows correctly
- Price is visible with ₱ symbol
- Price source badge (DOE/User) appears
- Distance in km displays
- Estimated time in minutes shows
- Star rating (if available) appears

#### Test Navigation

1. Click "🗺️ Navigate" on any station
2. Google Maps should open in new tab
3. Directions should be pre-loaded

#### Test Price Update

1. Click "💵 Update Price" on a station
2. Modal should appear
3. Enter new price (e.g., "57.50")
4. Click "Update"
5. Success alert should show
6. List should refresh with new price
7. Price source badge should change to "User"

#### Test Profile Management

1. Click "Profile" button
2. Update name or car model
3. Change fuel type
4. Click "Update Profile"
5. Success message should appear
6. Return to dashboard
7. Verify fuel type reflects in search

---

### 3. Mobile Responsive Testing

Test on different screen sizes:

#### Desktop (1920x1080)

- Layout should be wide with comfortable spacing
- Station cards should display side-by-side info

#### Tablet (768x1024)

- Priority buttons should wrap nicely
- Station cards should be readable

#### Mobile (375x667)

- Header should stack vertically
- Form inputs should be full-width
- Station cards should stack information
- Price should be clearly visible
- Buttons should be touch-friendly

---

### 4. Edge Cases & Error Handling

#### Test Without API Key

1. Remove `GOOGLE_MAPS_API_KEY` from backend/.env
2. Restart backend
3. Try searching stations
4. Should get empty results or fallback to basic distance

#### Test With Wrong Credentials

1. Try logging in with wrong password
2. Should show error message
3. Try registering with existing email
4. Should show "Email already registered"

#### Test Without Location Permission

1. Deny location when browser asks
2. App should default to Manila coordinates
3. Search should still work

#### Test Offline Backend

1. Stop backend server
2. Try using frontend
3. Should show connection errors

#### Test Invalid Price Update

1. Try updating price with empty value
2. Try with negative number
3. Should handle gracefully

---

### 5. Performance Testing

#### Load Time

- Initial page load should be under 2 seconds
- Station search should complete within 3 seconds
- API calls should respond within 1 second

#### Multiple Stations

1. Search in a dense area (e.g., Makati CBD)
2. Should handle 20+ stations smoothly
3. Scrolling should be smooth
4. Filtering should be instant

---

### 6. Data Integrity Testing

#### Price Source Logic

1. Search for stations (all show DOE prices)
2. Update a price for a station
3. Search again
4. That station should show USER price
5. Others still show DOE

#### Token Persistence

1. Login
2. Close browser
3. Reopen app
4. Should still be logged in
5. Logout
6. Close browser
7. Reopen app
8. Should be on login page

---

## Automated Testing (Future)

### Backend Unit Tests

```python
# test_app.py
import pytest
from backend.app import app, db

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'

def test_register_user(client):
    response = client.post('/api/register', json={
        'name': 'Test',
        'email': 'test@test.com',
        'password': 'test123'
    })
    assert response.status_code == 201
    assert 'token' in response.json
```

### Frontend Tests

```javascript
// App.test.js
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login page", () => {
  render(<App />);
  const linkElement = screen.getByText(/CheapFuel/i);
  expect(linkElement).toBeInTheDocument();
});
```

---

## Bug Reporting Template

When reporting bugs, include:

```
**Environment:**
- OS: macOS / Windows / Linux
- Browser: Chrome 120 / Safari 17 / Firefox 120
- Screen Size: 1920x1080

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Scroll down to...
4. See error

**Expected Behavior:**
What you expected to happen

**Actual Behavior:**
What actually happened

**Screenshots:**
If applicable

**Console Errors:**
Any errors from browser console or terminal
```

---

## Known Issues

1. **Google Maps API Quota**: Limited free tier (search may fail after many requests)
2. **Location Accuracy**: GPS may be imprecise indoors
3. **Price Freshness**: DOE prices only update weekly (Tuesdays 6 AM)
4. **Pagination**: Current implementation loads all results at once

---

## Success Criteria

✅ User can register and login  
✅ User can search for nearby gas stations  
✅ Results show price, distance, and time  
✅ User can filter by fuel type  
✅ User can prioritize by price/time/distance  
✅ User can navigate to stations via Google Maps  
✅ User can report price updates  
✅ Price sources are visually distinct (DOE vs User)  
✅ App is mobile-responsive  
✅ Profile management works

---

## Performance Benchmarks

- Registration: < 500ms
- Login: < 500ms
- Station Search: < 3s
- Price Update: < 500ms
- Navigation: Instant (opens external link)
- Page Load: < 2s

---

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Sufficient color contrast
- [ ] Touch targets are 44x44px minimum
- [ ] Form labels are present
- [ ] Error messages are clear
