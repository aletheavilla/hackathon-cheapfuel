import React, { useEffect, useRef, useState } from "react";

const AUTOCOMPLETE_ENDPOINT = "https://places.googleapis.com/v1/places:autocomplete";
const PLACE_DETAILS_ENDPOINT = "https://places.googleapis.com/v1/places";

function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Enter your address...",
}) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
  const blurTimeoutRef = useRef(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API key is missing.");
      return;
    }

    if (query.trim().length < 3) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        setError("");

        const response = await fetch(AUTOCOMPLETE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
          },
          body: JSON.stringify({
            input: query,
            includedRegionCodes: ["ph"],
          }),
        });

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok || data.error) {
          throw new Error(
            data?.error?.message || "Failed to fetch address suggestions",
          );
        }

        const mappedSuggestions = (data.suggestions || [])
          .map((item) => item.placePrediction)
          .filter(Boolean)
          .map((prediction) => ({
            placeId: prediction.placeId,
            label: prediction.text?.text || "",
          }))
          .filter((prediction) => prediction.placeId && prediction.label);

        setSuggestions(mappedSuggestions);
        setShowSuggestions(mappedSuggestions.length > 0);
      } catch (fetchError) {
        setSuggestions([]);
        setShowSuggestions(false);
        setError(fetchError.message || "Failed to load suggestions");
      } finally {
        if (!cancelled) {
          setLoadingSuggestions(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [apiKey, query]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectSuggestion = async (suggestion) => {
    try {
      setLoadingDetails(true);
      setError("");

      const response = await fetch(
        `${PLACE_DETAILS_ENDPOINT}/${suggestion.placeId}`,
        {
          method: "GET",
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
          },
        },
      );

      const placeData = await response.json();

      if (!response.ok || placeData.error) {
        throw new Error(
          placeData?.error?.message || "Failed to fetch selected place details",
        );
      }

      if (!placeData.location) {
        throw new Error("Selected address has no location data.");
      }

      const selectedAddress =
        placeData.formattedAddress ||
        placeData.displayName?.text ||
        suggestion.label;

      const addressData = {
        address: selectedAddress,
        latitude: placeData.location.latitude,
        longitude: placeData.location.longitude,
        place_id: placeData.id || suggestion.placeId,
        name: placeData.displayName?.text || selectedAddress,
      };

      setQuery(selectedAddress);
      setShowSuggestions(false);
      onAddressSelect(addressData);
    } catch (detailsError) {
      setError(detailsError.message || "Failed to resolve selected address");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setError("");
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
    }, 180);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          width: "100%",
          padding: "12px 40px 12px 12px",
          fontSize: "16px",
          border: "2px solid #e5e7eb",
          borderRadius: "8px",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />

      {query && (
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClear}
          type="button"
          style={{
            position: "absolute",
            right: "8px",
            top: "19px",
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

      {showSuggestions && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 20,
            marginTop: "4px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {loadingSuggestions ? (
            <div style={{ padding: "10px 12px", color: "#6b7280" }}>
              Loading suggestions...
            </div>
          ) : suggestions.length === 0 ? (
            <div style={{ padding: "10px 12px", color: "#6b7280" }}>
              No suggestions found.
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.placeId}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectSuggestion(suggestion)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderBottom: "1px solid #f3f4f6",
                  color: "#111827",
                  fontSize: "14px",
                }}
              >
                {suggestion.label}
              </button>
            ))
          )}
        </div>
      )}

      {(error || loadingDetails) && (
        <p
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: error ? "#ef4444" : "#6b7280",
          }}
        >
          {loadingDetails ? "Resolving selected address..." : `⚠️ ${error}`}
        </p>
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
