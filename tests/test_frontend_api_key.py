#!/usr/bin/env python3
"""
Quick test to check if Google Maps API key works for frontend (Maps JavaScript API)
"""
import requests
import sys

API_KEY = os.getenv("REACT_APP_GOOGLE_MAPS_API_KEY")


def test_maps_javascript_api():
    """Test if Maps JavaScript API is enabled"""
    print("Testing Maps JavaScript API...")

    # Try to load the script
    url = f"https://maps.googleapis.com/maps/api/js?key={API_KEY}&libraries=places"

    try:
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            content = response.text

            # Check for common error messages in the response
            if "Google Maps JavaScript API" in content or "google.maps" in content:
                print("✅ Maps JavaScript API is accessible")
                return True
            elif "ApiNotActivatedMapError" in content:
                print("❌ Maps JavaScript API is NOT ENABLED")
                print(
                    "   Go to: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
                )
                return False
            elif "RefererNotAllowedMapError" in content:
                print("❌ API key has referrer restrictions that block localhost")
                print("   Go to: https://console.cloud.google.com/apis/credentials")
                print("   Add: http://localhost:3000/*")
                return False
            elif "REQUEST_DENIED" in content:
                print("❌ Request denied - check API key restrictions")
                return False
            else:
                print("⚠️  Unknown response, but API key seems to work")
                return True
        else:
            print(f"❌ HTTP {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_places_api():
    """Test if Places API is enabled"""
    print("\nTesting Places API...")

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": "14.5995,120.9842",
        "radius": 1000,
        "type": "restaurant",
        "key": API_KEY,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if data.get("status") == "OK" or data.get("status") == "ZERO_RESULTS":
            print("✅ Places API is enabled and working")
            return True
        elif data.get("status") == "REQUEST_DENIED":
            error_msg = data.get("error_message", "")
            print(f"❌ Places API: REQUEST_DENIED")
            print(f"   Error: {error_msg}")
            if "not enabled" in error_msg.lower():
                print(
                    "   Go to: https://console.cloud.google.com/apis/library/places-backend.googleapis.com"
                )
            return False
        else:
            print(f"⚠️  Places API status: {data.get('status')}")
            print(f"   Message: {data.get('error_message', 'No error message')}")
            return False

    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("Google Maps API Key Test - Frontend")
    print("=" * 60)
    print(f"API Key: {API_KEY[:10]}...{API_KEY[-5:]}")
    print()

    results = []
    results.append(test_maps_javascript_api())
    results.append(test_places_api())

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    if all(results):
        print("✅ All tests passed! API key is working correctly.")
        print("\nIf autocomplete still doesn't work:")
        print("1. Make sure you restarted the frontend server")
        print("2. Clear browser cache (Ctrl+Shift+R)")
        print("3. Check browser console for errors (F12)")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        print("\nQuick fixes:")
        print("• Enable APIs at: https://console.cloud.google.com/apis/library")
        print("• Check API key restrictions")
        print("• Make sure billing is enabled")
        sys.exit(1)
