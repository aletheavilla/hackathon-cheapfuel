"use client";

import { useEffect } from "react";

function ApiKeyDiagnostics() {
  useEffect(() => {
    console.group("🔍 Google Maps API Diagnostics");
    console.log("Environment:", process.env.NODE_ENV);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("❌ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is undefined!");
    } else {
      console.log("✅ API Key found:", apiKey.substring(0, 10) + "...");
      console.log("Key length:", apiKey.length);
      console.log("Starts with AIza:", apiKey.startsWith("AIza"));
    }

    console.groupEnd();
  }, []);

  return null;
}

export default ApiKeyDiagnostics;


