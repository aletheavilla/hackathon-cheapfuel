# Quick Start: Using Address Autocomplete

## For Users

### How to Use the Address Input

1. **Open the Dashboard**
   - After logging in, you'll see the main dashboard
   - Look for the "📍 Your Location" input box

2. **Enter Your Address**
   - Click on the input box
   - Start typing your address (e.g., "SM Mall of Asia")
   - Wait for suggestions to appear

3. **Select an Address**
   - Choose an address from the dropdown suggestions
   - **Important**: You must select from the dropdown
   - Manual typing without selection won't work

4. **Confirmation**
   - A green checkmark (✓) will appear below the input
   - Shows your selected address
   - Gas stations will automatically load

5. **Change Address**
   - Click the × button to clear
   - Type a new address
   - Select from suggestions again

### Tips
- ✅ Type slowly and wait for suggestions
- ✅ Select the most specific address available
- ✅ Look for landmarks if you don't know the exact street
- ❌ Don't press Enter without selecting from dropdown
- ❌ Don't type complete address manually

---

## For Developers

### Quick Setup (5 minutes)

1. **Get Google Maps API Key**
   ```bash
   # Visit: https://console.cloud.google.com/
   # Enable: Maps JavaScript API, Places API, Geocoding API, Distance Matrix API, Maps Embed API
   # Create API key
   ```

2. **Configure Frontend**
   ```bash
   cd frontend
   echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here" > .env
   ```

3. **Configure Backend**
   ```bash
   cd backend
   echo "GOOGLE_MAPS_API_KEY=your_key_here" >> .env
   ```

4. **Install Dependencies** (if not done)
   ```bash
   cd frontend
   npm install
   ```

5. **Run the App**
   ```bash
   # Terminal 1
   cd backend && python app.py
   
   # Terminal 2
   cd frontend && npm start
   ```

6. **Test It**
   - Open http://localhost:3000
   - Log in
   - Type "SM Mall of Asia" in the address box
   - Select from dropdown
   - Should see gas stations load

### Verify Setup

Run the test script:
```bash
python test_google_maps_api.py
```

Should see:
```
✓ Distance Matrix API is working!
✓ Places API is working!
✓ Maps Embed API key format is valid!
```

### Common Issues

**"Google Maps API not loaded"**
- Restart frontend: `npm start`
- Check `.env` file exists in `frontend/`
- Check API key is correct

**Autocomplete not showing**
- Enable Places API in Google Cloud Console
- Check API key has no domain restrictions
- Check browser console for errors

**Backend geocoding fails**
- Check `backend/.env` has `GOOGLE_MAPS_API_KEY`
- Enable Geocoding API in Google Cloud Console

### Quick Customization

**Change country restriction:**
Edit `frontend/src/components/AddressAutocomplete.js`:
```javascript
componentRestrictions: { country: 'us' }, // Change 'ph' to any country
```

**Remove country restriction:**
```javascript
// Remove or comment out this line:
// componentRestrictions: { country: 'ph' },
```

**Change autocomplete types:**
```javascript
types: ['geocode'], // or ['establishment'], ['(cities)']
```

---

## For Testers

### Test Checklist

- [ ] Address autocomplete appears when typing
- [ ] Suggestions are relevant to typed text
- [ ] Selecting address shows green checkmark
- [ ] Gas stations load after address selection
- [ ] Clear button (×) removes address
- [ ] Cannot submit without selecting from dropdown
- [ ] Works with various address formats
- [ ] Restricted to Philippines addresses
- [ ] Error message for invalid selections

### Test Cases

1. **Valid Address**
   - Input: "SM Mall of Asia"
   - Expected: Suggestions appear, selection works, stations load

2. **Partial Address**
   - Input: "Makati City"
   - Expected: Multiple suggestions, can select, stations load

3. **Landmark**
   - Input: "Manila Cathedral"
   - Expected: Shows landmark, selection works

4. **Invalid Manual Entry**
   - Input: "asdfghjkl" (no selection)
   - Expected: No action, no stations load

5. **Clear and Retry**
   - Input: Valid address, clear, new address
   - Expected: Works both times, stations update

### Report Issues

If you find bugs, report:
- Browser and version
- What you typed
- What suggestions appeared
- Error messages (check console)
- Screenshots

---

## Resources

- **Detailed Setup**: [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)
- **Implementation Details**: [ADDRESS_AUTOCOMPLETE_IMPLEMENTATION.md](./ADDRESS_AUTOCOMPLETE_IMPLEMENTATION.md)
- **API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Main README**: [README.md](./README.md)

## Need Help?

1. Check [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) troubleshooting section
2. Run `python test_google_maps_api.py` to verify API setup
3. Check browser console for error messages
4. Verify `.env` files are configured correctly
5. Ensure all Google Maps APIs are enabled

---

**Made with ❤️ to help drivers find the cheapest gas**

