import React, { useRef, useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const libraries = ["places"];

function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Enter your address...",
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    console.log(
      "AddressAutocomplete: isLoaded=",
      isLoaded,
      "inputRef=",
      !!inputRef.current,
    );

    if (!isLoaded || !inputRef.current) {
      return;
    }

    console.log(
      "AddressAutocomplete: Initializing Google Places Autocomplete...",
    );

    // Initialize Google Places Autocomplete
    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode"], // Changed from ['address', 'establishment'] to avoid conflicts
          componentRestrictions: { country: "ph" }, // Restrict to Philippines
          fields: [
            "formatted_address",
            "geometry",
            "name",
            "place_id",
            "address_components",
          ],
        },
      );

      console.log("AddressAutocomplete: ✅ Autocomplete created successfully");

      // Add listener for place selection
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        console.log("AddressAutocomplete: Place selected:", place);

        // Validate that the place has geometry (location data)
        if (!place.geometry || !place.geometry.location) {
          console.error("AddressAutocomplete: No geometry found");
          alert(
            "❌ Invalid Selection\n\nYou must SELECT an address from the dropdown suggestions.\nDo not just type and press Enter.\n\nPlease:\n1. Start typing your address\n2. Wait for suggestions to appear\n3. Click/select one of the suggestions",
          );
          // Clear the input
          if (inputRef.current) {
            inputRef.current.value = "";
          }
          return;
        }

        // Extract the relevant information
        const addressData = {
          address: place.formatted_address || place.name,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          place_id: place.place_id,
          name: place.name,
        };

        console.log("AddressAutocomplete: Sending address data:", addressData);

        // Call the parent callback with the address data
        onAddressSelect(addressData);
      });
    } catch (error) {
      console.error("AddressAutocomplete: ❌ Error initializing:", error);
    }

    // Cleanup
    return () => {
      if (
        autocompleteRef.current &&
        window.google &&
        window.google.maps.event
      ) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current,
        );
      }
    };
  }, [isLoaded, onAddressSelect]);

  // Handle manual input clearing
  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Show error message if loading failed
  if (loadError) {
    console.error("AddressAutocomplete: Load error:", loadError);
    return (
      <div>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          disabled
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #ef4444",
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            cursor: "not-allowed",
          }}
        />
        <p
          style={{
            marginTop: "8px",
            fontSize: "14px",
            color: "#ef4444",
          }}
        >
          ⚠️ Failed to load Google Maps. Check console for details.
        </p>
        <p
          style={{
            marginTop: "4px",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          Error: {loadError.message}
        </p>
      </div>
    );
  }

  // Show loading state
  if (!isLoaded) {
    return (
      <div>
        <input
          type="text"
          className="form-input"
          placeholder="Loading Google Maps..."
          disabled
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            backgroundColor: "#f9fafb",
            cursor: "wait",
          }}
        />
        <p
          style={{
            marginTop: "8px",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          🔄 Loading address autocomplete...
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        ref={inputRef}
        type="text"
        className="form-input"
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 40px 12px 12px",
          fontSize: "16px",
          border: "2px solid #e5e7eb",
          borderRadius: "8px",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#3b82f6";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e5e7eb";
        }}
        onKeyDown={(e) => {
          // Prevent form submission on Enter if no place is selected
          if (e.key === "Enter") {
            e.preventDefault();
            console.log(
              "AddressAutocomplete: Enter pressed - use dropdown to select!",
            );
          }
        }}
      />
      {inputRef.current?.value && (
        <button
          onClick={handleClear}
          type="button"
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            color: "#9ca3af",
            padding: "4px",
          }}
          aria-label="Clear address"
        >
          ×
        </button>
      )}
      <p
        style={{
          marginTop: "6px",
          fontSize: "13px",
          color: "#6b7280",
          fontStyle: "italic",
        }}
      >
        💡 Tip: Start typing, then <strong>select from dropdown</strong> (don't
        just press Enter)
      </p>
    </div>
  );
}

export default AddressAutocomplete;
