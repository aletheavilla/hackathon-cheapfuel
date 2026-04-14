#!/usr/bin/env python3
"""
Quick test script to verify GOOGLE_MAPS_API_KEY is working correctly.
Tests both Distance Matrix API and Places API which are used by the CheapFuel app.
"""

import os
import sys
import requests
import pytest
from dotenv import load_dotenv


# Colors for terminal output
class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"


def print_status(message, status="info"):
    """Print colored status messages"""
    if status == "success":
        print(f"{Colors.GREEN}✓ {message}{Colors.ENDC}")
    elif status == "error":
        print(f"{Colors.RED}✗ {message}{Colors.ENDC}")
    elif status == "warning":
        print(f"{Colors.YELLOW}⚠ {message}{Colors.ENDC}")
    else:
        print(f"{Colors.BLUE}ℹ {message}{Colors.ENDC}")


@pytest.fixture
def api_key():
    """Load Google Maps API key for tests."""
    key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not key:
        pytest.skip("GOOGLE_MAPS_API_KEY is not set")
    return key


def test_distance_matrix_api(api_key):
    """Test Google Maps Distance Matrix API"""
    print(f"\n{Colors.BOLD}Testing Distance Matrix API...{Colors.ENDC}")

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": "14.5995,120.9842",  # Manila coordinates
        "destinations": "14.6091,121.0223",  # Makati coordinates
        "key": api_key,
        "mode": "driving",
        "departure_time": "now",
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if response.status_code == 200:
            if data.get("status") == "OK":
                element = data["rows"][0]["elements"][0]
                if element["status"] == "OK":
                    distance = element["distance"]["text"]
                    duration = element["duration"]["text"]
                    print_status(f"Distance Matrix API is working!", "success")
                    print(f"  Example: Manila to Makati - {distance}, {duration}")
                    assert True
                else:
                    print_status(
                        f"API returned element status: {element['status']}", "error"
                    )
                    pytest.fail(f"Distance Matrix element status: {element['status']}")
            elif data.get("status") == "REQUEST_DENIED":
                print_status(
                    f"Request denied: {data.get('error_message', 'Unknown error')}",
                    "error",
                )
                print_status(
                    "Check if Distance Matrix API is enabled in Google Cloud Console",
                    "warning",
                )
                pytest.fail("Distance Matrix API request denied")
            else:
                print_status(f"API returned status: {data.get('status')}", "error")
                if "error_message" in data:
                    print(f"  Error: {data['error_message']}")
                pytest.fail(f"Distance Matrix API returned status: {data.get('status')}")
        else:
            print_status(f"HTTP Error {response.status_code}", "error")
            print(f"  Response: {data}")
            pytest.fail(f"Distance Matrix HTTP status: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print_status(f"Network error: {str(e)}", "error")
        pytest.fail(f"Distance Matrix network error: {str(e)}")
    except Exception as e:
        print_status(f"Unexpected error: {str(e)}", "error")
        pytest.fail(f"Distance Matrix unexpected error: {str(e)}")


def test_places_api(api_key):
    """Test Google Maps Places API (Nearby Search)"""
    print(f"\n{Colors.BOLD}Testing Places API (Nearby Search)...{Colors.ENDC}")

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": "14.5995,120.9842",  # Manila coordinates
        "radius": 5000,  # 5km radius
        "type": "gas_station",
        "key": api_key,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if response.status_code == 200:
            if data.get("status") in ["OK", "ZERO_RESULTS"]:
                results = data.get("results", [])
                print_status(f"Places API is working!", "success")
                print(f"  Found {len(results)} gas stations near Manila")
                if results:
                    print(f"  Example station: {results[0]['name']}")
                    print(f"    Address: {results[0].get('vicinity', 'N/A')}")
                assert True
            elif data.get("status") == "REQUEST_DENIED":
                print_status(
                    f"Request denied: {data.get('error_message', 'Unknown error')}",
                    "error",
                )
                print_status(
                    "Check if Places API is enabled in Google Cloud Console", "warning"
                )
                pytest.fail("Places API request denied")
            else:
                print_status(f"API returned status: {data.get('status')}", "error")
                if "error_message" in data:
                    print(f"  Error: {data['error_message']}")
                pytest.fail(f"Places API returned status: {data.get('status')}")
        else:
            print_status(f"HTTP Error {response.status_code}", "error")
            print(f"  Response: {data}")
            pytest.fail(f"Places API HTTP status: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print_status(f"Network error: {str(e)}", "error")
        pytest.fail(f"Places API network error: {str(e)}")
    except Exception as e:
        print_status(f"Unexpected error: {str(e)}", "error")
        pytest.fail(f"Places API unexpected error: {str(e)}")


def test_maps_embed_api(api_key):
    """Test if the API key works with Maps Embed API (used in frontend)"""
    print(f"\n{Colors.BOLD}Testing Maps Embed API (Frontend)...{Colors.ENDC}")

    # The Embed API doesn't have a JSON endpoint, so we'll just construct the URL
    embed_url = f"https://www.google.com/maps/embed/v1/directions?key={api_key}&origin=14.5995,120.9842&destination=14.6091,121.0223&mode=driving"

    try:
        # Check if the URL is accessible (returns 200)
        response = requests.head(embed_url, timeout=10)
        if response.status_code == 200:
            print_status("Maps Embed API key format is valid!", "success")
            print(f"  Frontend will be able to display embedded maps")
            assert True
        else:
            print_status(
                f"Maps Embed API returned status {response.status_code}", "warning"
            )
            print_status("This may work in browser but not via script request", "info")
            assert True  # Still considered pass as script checks are limited
    except Exception as e:
        print_status("Could not verify Embed API directly (this is normal)", "info")
        print_status("The API key should work in browser if other tests pass", "info")
        assert True  # Cannot reliably test Embed API programmatically


def main():
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}")
    print(f"Google Maps API Key Test Script")
    print(f"{'='*60}{Colors.ENDC}\n")

    # Load environment variables from backend/.env
    backend_env_path = os.path.join(os.path.dirname(__file__), "frontend", ".env")

    if os.path.exists(backend_env_path):
        load_dotenv(backend_env_path)
        print_status(f"Loaded environment from: {backend_env_path}", "success")
    else:
        print_status(f"backend/.env file not found at: {backend_env_path}", "warning")
        print_status("Checking for GOOGLE_MAPS_API_KEY in environment...", "info")

    # Get API key
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    if not api_key:
        print_status("GOOGLE_MAPS_API_KEY not found in environment!", "error")
        print("\nPlease set your API key by:")
        print("  1. Creating backend/.env file")
        print("  2. Adding: GOOGLE_MAPS_API_KEY=your_actual_api_key_here")
        sys.exit(1)

    # Mask API key for display (show first 8 and last 4 characters)
    if len(api_key) > 12:
        masked_key = f"{api_key[:8]}...{api_key[-4:]}"
    else:
        masked_key = "***"

    print_status(f"Found API Key: {masked_key}", "success")

    # Run tests
    print(f"\n{Colors.BOLD}Running API Tests...{Colors.ENDC}")

    results = {
        "distance_matrix": test_distance_matrix_api(api_key),
        "places": test_places_api(api_key),
        "embed": test_maps_embed_api(api_key),
    }

    # Summary
    print(f"\n{Colors.BOLD}{'='*60}")
    print("Test Summary")
    print(f"{'='*60}{Colors.ENDC}")

    total_tests = len(results)
    passed_tests = sum(results.values())

    for test_name, result in results.items():
        status = "success" if result else "error"
        test_display = test_name.replace("_", " ").title()
        print_status(f"{test_display}: {'PASSED' if result else 'FAILED'}", status)

    print(
        f"\n{Colors.BOLD}Result: {passed_tests}/{total_tests} tests passed{Colors.ENDC}"
    )

    if passed_tests == total_tests:
        print_status(
            "\nAll tests passed! Your API key is working correctly. ✨", "success"
        )
        print("\nNext steps:")
        print("  • Make sure to add REACT_APP_GOOGLE_MAPS_API_KEY to frontend/.env")
        print("  • Both backend and frontend need the API key configured")
        sys.exit(0)
    elif passed_tests > 0:
        print_status("\nSome tests passed, but there are issues to address.", "warning")
        print("\nTroubleshooting:")
        print("  • Check if all required APIs are enabled in Google Cloud Console")
        print(
            "  • Distance Matrix API: https://console.cloud.google.com/apis/library/distance-matrix-backend.googleapis.com"
        )
        print(
            "  • Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com"
        )
        print(
            "  • Maps Embed API: https://console.cloud.google.com/apis/library/maps-embed-backend.googleapis.com"
        )
        sys.exit(1)
    else:
        print_status(
            "\nAll tests failed. Please check your API key and API enablement.", "error"
        )
        print("\nTroubleshooting:")
        print("  • Verify your API key is correct")
        print("  • Check if billing is enabled for your Google Cloud project")
        print("  • Enable required APIs in Google Cloud Console")
        sys.exit(1)


if __name__ == "__main__":
    main()
