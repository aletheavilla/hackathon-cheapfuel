# Environment Variables Setup Instructions

Since `.env` files may be ignored by git, you need to create them manually.

## Frontend Environment Variables

Create the frontend `.env` file:

```bash
cd frontend
cat > .env << 'ENVFILE'
# Google Maps API Key for Frontend
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
ENVFILE
```

**Or edit manually:**
```bash
cd frontend
nano .env
# Or use your preferred editor:
# code .env
# vim .env
```

Then add:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Backend Environment Variables

Check if backend `.env` exists:
```bash
cd backend
ls -la .env
```

If it doesn't exist, create it:
```bash
cd backend
cat > .env << 'ENVFILE'
# Google Maps API Key for Backend
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Flask Secret Key (generate your own)
SECRET_KEY=your-secret-key-change-in-production

# OpenAI API Key (optional, for GPT-4 recommendations)
OPENAI_API_KEY=your-openai-key-here
ENVFILE
```

**Or add to existing backend `.env`:**
```bash
cd backend
echo "GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here" >> .env
```

## Verify Configuration

**Check frontend `.env`:**
```bash
cat frontend/.env
```

**Check backend `.env`:**
```bash
cat backend/.env
```

## Replace Placeholder Keys

After creating the files, replace the placeholder values with your actual API keys:

1. Get your Google Maps API key from: https://console.cloud.google.com/
2. Edit the `.env` files and replace `your_google_maps_api_key_here` with your actual key

**Example (macOS/Linux):**
```bash
cd frontend
sed -i.bak 's/your_google_maps_api_key_here/AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/' .env

cd ../backend
sed -i.bak 's/your_google_maps_api_key_here/AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/' .env
```

## Restart Servers

After setting environment variables, restart both servers:

```bash
# Stop current servers (Ctrl+C)

# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

## Verify It's Working

Run the test script:
```bash
python test_google_maps_api.py
```

Should see all tests pass:
```
✓ Distance Matrix API is working!
✓ Places API is working!
✓ Maps Embed API key format is valid!
```

## Security Notes

- **Never commit `.env` files to git**
- `.env` is already in `.gitignore`
- Use different API keys for development and production
- Restrict API keys in Google Cloud Console
- Monitor usage to prevent abuse

## Troubleshooting

**Frontend can't find API key:**
```bash
# Check if .env exists
ls -la frontend/.env

# Check contents
cat frontend/.env

# Make sure key starts with REACT_APP_
grep REACT_APP_ frontend/.env

# Restart frontend
cd frontend
npm start
```

**Backend can't find API key:**
```bash
# Check if .env exists
ls -la backend/.env

# Check contents
cat backend/.env

# Make sure GOOGLE_MAPS_API_KEY is set
grep GOOGLE_MAPS_API_KEY backend/.env

# Restart backend
cd backend
python app.py
```

**API key in .env but not loading:**
```bash
# Make sure there are no extra spaces
# Make sure there are no quotes around the key
# Format should be: KEY=value (no spaces, no quotes)

# Correct:
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXX

# Incorrect:
GOOGLE_MAPS_API_KEY = AIzaSyXXXXXX
GOOGLE_MAPS_API_KEY="AIzaSyXXXXXX"
```

## Quick Setup Script

Create a quick setup script:

```bash
cat > setup_env.sh << 'SCRIPT'
#!/bin/bash

echo "=== CheapFuel Environment Setup ==="
echo ""

# Get API key from user
read -p "Enter your Google Maps API key: " GMAP_KEY

# Frontend .env
echo "Creating frontend/.env..."
cat > frontend/.env << ENVFILE
REACT_APP_GOOGLE_MAPS_API_KEY=${GMAP_KEY}
ENVFILE

# Backend .env (check if exists)
if [ -f backend/.env ]; then
    echo "Backend .env exists, appending GOOGLE_MAPS_API_KEY..."
    # Remove old key if exists
    grep -v "GOOGLE_MAPS_API_KEY=" backend/.env > backend/.env.tmp
    mv backend/.env.tmp backend/.env
    echo "GOOGLE_MAPS_API_KEY=${GMAP_KEY}" >> backend/.env
else
    echo "Creating backend/.env..."
    cat > backend/.env << ENVFILE
GOOGLE_MAPS_API_KEY=${GMAP_KEY}
SECRET_KEY=dev-secret-key-change-in-production
ENVFILE
fi

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "Next steps:"
echo "1. Verify: cat frontend/.env"
echo "2. Verify: cat backend/.env"
echo "3. Test: python test_google_maps_api.py"
echo "4. Run: ./run.sh"
SCRIPT

chmod +x setup_env.sh
```

Then run:
```bash
./setup_env.sh
```

## Alternative: Direct File Editing

If you prefer to edit files directly:

**Frontend .env:**
1. Navigate to `frontend/` directory
2. Create file named `.env` (note the leading dot)
3. Add: `REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_key`
4. Save and close

**Backend .env:**
1. Navigate to `backend/` directory
2. Create or edit file named `.env`
3. Add: `GOOGLE_MAPS_API_KEY=your_actual_key`
4. Save and close

## Next Steps

After setting up environment variables:

1. ✅ Test the API keys: `python test_google_maps_api.py`
2. ✅ Start the backend: `cd backend && python app.py`
3. ✅ Start the frontend: `cd frontend && npm start`
4. ✅ Open http://localhost:3000
5. ✅ Try the address autocomplete feature

