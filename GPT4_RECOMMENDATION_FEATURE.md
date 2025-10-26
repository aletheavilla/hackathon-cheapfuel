# GPT-4 Recommendation Feature

## Overview
The CheapFuel app now includes an AI-powered recommendation feature that uses GPT-4 to provide personalized suggestions for the cheapest gas station near you.

## Features
- **Smart Recommendations**: Uses GPT-4 to generate friendly, personalized recommendations
- **Automatic Selection**: Automatically recommends the cheapest gas station from search results
- **Contextual Information**: Includes distance, price, and travel time in the recommendation
- **Fallback Support**: If OpenAI API is unavailable, falls back to a basic recommendation message

## How It Works

### Backend Implementation
1. **New Endpoint**: `/api/stations/recommendation` (POST)
   - Accepts a list of gas stations and fuel type
   - Finds the cheapest station
   - Calls GPT-4 API to generate a personalized recommendation
   - Returns the recommendation text

2. **GPT-4 Integration**:
   - Uses the OpenAI Python SDK
   - Model: `gpt-4`
   - Temperature: 0.7 (for friendly, varied responses)
   - Max tokens: 150

3. **Environment Variables**:
   - `OPENAI_API_KEY` or `OPEN_API_KEY`: Your OpenAI API key

### Frontend Implementation
1. **Dashboard Updates**:
   - New state variables for recommendation and loading status
   - Automatic fetch of recommendation after station search
   - Display recommendation in a highlighted green box near the top of the page

2. **UI Components**:
   - **Recommendation Box**: Green-themed card with lightbulb icon
   - **Loading State**: Shows "Getting personalized recommendation..."
   - **Placement**: Between search controls and results list

## Usage

### For Users
1. Log in to CheapFuel
2. Set your fuel type and search preferences
3. View the list of nearby gas stations
4. The recommendation will automatically appear at the top of the results
5. The recommendation highlights the cheapest station with details about savings and convenience

### For Developers

#### Installation
```bash
# Install the OpenAI package
cd backend
source venv/bin/activate
pip install openai==1.12.0
```

#### Configuration
Add your OpenAI API key to `backend/.env`:
```
OPENAI_API_KEY=your_api_key_here
# OR
OPEN_API_KEY=your_api_key_here
```

#### Testing
```bash
# Start the backend
cd backend
source venv/bin/activate
python app.py

# In another terminal, start the frontend
cd frontend
npm start
```

## API Documentation

### POST /api/stations/recommendation

**Request:**
```json
{
  "stations": [
    {
      "id": 1,
      "name": "Shell Station",
      "price": 55.50,
      "distance_km": 2.5,
      "duration_min": 10,
      "address": "123 Main St"
    }
  ],
  "fuel_type": "Regular"
}
```

**Response:**
```json
{
  "recommendation": "Great news! Shell Station offers the best value with Regular gas at ₱55.50/liter. It's conveniently located just 2.5 km away, making it an excellent choice for your next fill-up! 🚗",
  "cheapest_station": {
    "id": 1,
    "name": "Shell Station",
    "price": 55.50,
    "distance_km": 2.5
  }
}
```

**Error Handling:**
- If no stations provided: 400 Bad Request
- If OpenAI API fails: Returns fallback recommendation
- If API key missing: Returns basic formatted recommendation

## Example Output

The GPT-4 recommendation might look like:

> 💡 **Recommendation**
>
> Great news! Shell Station offers the best value with Regular gas at ₱55.50/liter. It's conveniently located just 2.5 km away, making it an excellent choice for your next fill-up! The short 10-minute drive means you'll save both time and money. 🚗

## Cost Considerations

- **GPT-4 API Usage**: Each recommendation costs approximately $0.03-$0.06
- **Rate Limiting**: Recommendations are only generated when search results change
- **Fallback**: Basic recommendations work without API calls

## Future Enhancements

Potential improvements:
1. **User Preferences**: Consider user's saved preferences (e.g., brand loyalty, amenities)
2. **Route Optimization**: Recommend stations along user's common routes
3. **Time-based Suggestions**: Recommend based on time of day and traffic
4. **Multi-station Recommendations**: Suggest alternative stations with different benefits
5. **Savings Calculator**: Show estimated savings compared to other stations
6. **Caching**: Cache recommendations to reduce API calls

## Troubleshooting

### Issue: Recommendation not showing
- Check that the backend is running
- Verify `OPENAI_API_KEY` or `OPEN_API_KEY` is set in `.env`
- Check browser console for API errors
- Look for fallback message (indicates API issue)

### Issue: Generic recommendation instead of GPT-4
- Verify API key is valid and has credits
- Check backend logs for OpenAI API errors
- Ensure `openai` package is installed

### Issue: Slow recommendation generation
- GPT-4 API can take 2-5 seconds
- Check your internet connection
- Consider caching or using GPT-3.5-turbo for faster responses

## Credits

Built using:
- OpenAI GPT-4 API
- Flask REST API
- React Frontend

