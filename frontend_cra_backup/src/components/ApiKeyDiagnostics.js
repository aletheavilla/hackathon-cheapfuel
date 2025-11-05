import { useEffect } from "react";

function ApiKeyDiagnostics() {
  useEffect(() => {
    console.group("🔍 Google Maps API Diagnostics");
    console.log("Environment:", process.env.NODE_ENV);

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("❌ REACT_APP_GOOGLE_MAPS_API_KEY is undefined!");
      console.log("Make sure:");
      console.log("1. frontend/.env file exists");
      console.log("2. It contains: REACT_APP_GOOGLE_MAPS_API_KEY=your_key");
      console.log("3. You restarted the dev server after creating .env");
    } else {
      console.log("✅ API Key found:", apiKey.substring(0, 10) + "...");
      console.log("Key length:", apiKey.length, "(should be 39)");
      console.log("Starts with AIza:", apiKey.startsWith("AIza"));
    }

    console.log("All env vars starting with REACT_APP_:");
    Object.keys(process.env)
      .filter((key) => key.startsWith("REACT_APP_"))
      .forEach((key) => {
        console.log(`  ${key}:`, process.env[key]?.substring(0, 20) + "...");
      });

    console.groupEnd();
  }, []);

  return null;
}

export default ApiKeyDiagnostics;
