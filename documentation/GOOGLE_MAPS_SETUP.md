# Google Maps Address Autocomplete Setup

This guide explains how to configure Google Maps address autocomplete in CheapFuel.

## Features

- ✅ Google Maps Places Autocomplete for address input
- ✅ Validates addresses against Google Maps database
- ✅ Only accepts addresses that exist in Google Maps
- ✅ Geocodes addresses to get coordinates
- ✅ Restricts to Philippines addresses by default

## Prerequisites

You need a Google Maps API key with the following APIs enabled:
1. **Maps JavaScript API** (for frontend autocomplete)
2. **Places API** (for address suggestions)
3. **Distance Matrix API** (for calculating distances)
4. **Geocoding API** (for backend validation)
5. **Maps Embed API** (for displaying embedded maps)

## Getting Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for Google Maps APIs)
4. Navigate to "APIs & Services" > "Library"
5. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API
   - Geocoding API
   - Maps Embed API
6. Go to "APIs & Services" > "Credentials"
7. Click "Create Credentials" > "API Key"
8. Copy your API key
9. (Recommended) Restrict your API key:
   - Set application restrictions (HTTP referrers for frontend, IP addresses for backend)
   - Set API restrictions to only the APIs you need

## Configuration

### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
touch .env
```

Add your Google Maps API key:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Important:** Replace the placeholder with your actual API key.

### Backend Configuration

Create a `.env` file in the `backend/` directory (if it doesn't exist):

```bash
cd backend
touch .env
```

Add your Google Maps API key:

```env
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-key-here  # Optional, for GPT-4 recommendations
```

## How It Works

### Frontend (User Interface)

1. User opens the Dashboard
2. Sees an address input box with the label "📍 Your Location"
3. As they type, Google Maps suggests matching addresses
4. User selects an address from the dropdown
5. The component validates that the address has valid coordinates
6. Only validated Google Maps addresses are accepted
7. The app uses the coordinates to search for nearby gas stations

### Backend (Validation)

The backend includes a `/api/geocode` endpoint that:
- Accepts an address string
- Validates it using Google Maps Geocoding API
- Returns coordinates only for valid addresses
- Rejects addresses not found in Google Maps
- Restricts results to Philippines (country:PH)

## Component Details

### AddressAutocomplete Component

Located at: `frontend/src/components/AddressAutocomplete.js`

**Props:**
- `onAddressSelect(addressData)` - Callback when a valid address is selected
- `placeholder` - Placeholder text for the input (optional)

**addressData object:**
```javascript
{
  address: "123 Main Street, Manila, Metro Manila, Philippines",
  latitude: 14.5995,
  longitude: 120.9842,
  place_id: "ChIJXXXXXXXXXXXXXXXX",
  name: "Main Street"
}
```

### Integration in Dashboard

The Dashboard component now:
- Displays the AddressAutocomplete component
- Shows the selected address with a green checkmark
- Uses the geocoded coordinates for searching gas stations
- No longer auto-detects location via browser geolocation

## Testing

1. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

2. Start the backend:
   ```bash
   cd backend
   python app.py
   ```

3. Open http://localhost:3000 in your browser
4. Log in or register
5. Type an address in the "Your Location" field
6. Select an address from the autocomplete dropdown
7. You should see a green checkmark and gas stations nearby

## Troubleshooting

### "Google Maps API not loaded" error

**Problem:** The Google Maps JavaScript API script isn't loading in the browser.

**Solution:**
1. Check that your `REACT_APP_GOOGLE_MAPS_API_KEY` is set in `frontend/.env`
2. Restart the frontend development server: `npm start`
3. Check browser console for API key errors
4. Verify your API key has Maps JavaScript API and Places API enabled

### "No geometry found for this place" error

**Problem:** User selected an address without valid coordinates.

**Solution:** This is expected behavior. The autocomplete only shows addresses from Google Maps, so this shouldn't happen often. If it does, ask the user to select a different address from the dropdown.

### Autocomplete dropdown doesn't appear

**Problem:** Places API might not be enabled or API key is invalid.

**Solutions:**
1. Verify Places API is enabled in Google Cloud Console
2. Check that your API key is correct in `frontend/.env`
3. Check browser console for API errors
4. Make sure your API key isn't restricted to exclude your localhost domain

### Backend geocoding endpoint returns 500 error

**Problem:** Backend can't access Google Maps API.

**Solutions:**
1. Check that `GOOGLE_MAPS_API_KEY` is set in `backend/.env`
2. Verify Geocoding API is enabled in Google Cloud Console
3. Check backend logs for detailed error messages

## API Restrictions (Security)

For production, restrict your API keys:

### Frontend API Key
- Add HTTP referrer restrictions:
  - `https://yourdomain.com/*`
  - `http://localhost:3000/*` (for development)
- API restrictions: Maps JavaScript API, Places API, Maps Embed API

### Backend API Key
- Add IP address restrictions (your server IPs)
- API restrictions: Distance Matrix API, Geocoding API, Places API

## Cost Considerations

Google Maps APIs are not free after the free tier:
- **Maps JavaScript API:** $7 per 1,000 loads
- **Places API (Autocomplete):** $2.83 per 1,000 requests
- **Geocoding API:** $5 per 1,000 requests
- **Distance Matrix API:** $5-$10 per 1,000 elements

Google provides **$200 free credit per month**, which covers:
- ~70,000 autocomplete requests
- ~40,000 geocoding requests
- ~20,000-40,000 distance matrix requests

Monitor your usage in Google Cloud Console.

## Alternative: Manual Address Entry

If you prefer not to use Google Maps autocomplete (to save costs or for other reasons), you can:
1. Use a simple text input
2. Call the backend `/api/geocode` endpoint when the user submits
3. Validate the address server-side before searching for gas stations

## Notes

- The autocomplete is restricted to Philippine addresses (`componentRestrictions: { country: 'ph' }`)
- You can modify this in `AddressAutocomplete.js` to support other countries
- The component cleans up event listeners when unmounted to prevent memory leaks
- Address validation happens entirely on the frontend for better UX
- Backend geocoding is available as a fallback or for server-side validation

