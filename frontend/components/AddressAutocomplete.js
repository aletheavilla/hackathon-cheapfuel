"use client";

import React, { useRef, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const libraries = ["places"];

function AddressAutocomplete({ onAddressSelect, placeholder = "Enter your address..." }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current) {
      return;
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "ph" },
          fields: [
            "formatted_address",
            "geometry",
            "name",
            "place_id",
            "address_components",
          ],
        },
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry || !place.geometry.location) {
          if (inputRef.current) {
            inputRef.current.value = "";
          }
          return;
        }

        const addressData = {
          address: place.formatted_address || place.name,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          place_id: place.place_id,
          name: place.name,
        };
        onAddressSelect(addressData);
      });
    } catch (error) {
      // swallow
    }

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

  if (loadError) {
    return (
      <div>
        <input type="text" className="form-input" placeholder={placeholder} disabled />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div>
        <input type="text" className="form-input" placeholder="Loading Google Maps..." disabled />
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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
}

export default AddressAutocomplete;


