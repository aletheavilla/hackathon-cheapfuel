import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchStations, updateStationPrice, getRecommendation } from '../services/api';
import AddressAutocomplete from './AddressAutocomplete';
import ApiKeyDiagnostics from './ApiKeyDiagnostics';

function Dashboard({ user, onLogout }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fuelType, setFuelType] = useState(user?.fuel_type || 'Regular');
  const [priority, setPriority] = useState('price');
  const [location, setLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [priceUpdateModal, setPriceUpdateModal] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [showMapForStation, setShowMapForStation] = useState(null);
  const [recommendation, setRecommendation] = useState('');
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [bannerExpanded, setBannerExpanded] = useState(false);
  const navigate = useNavigate();

  // Handle address selection from autocomplete
  const handleAddressSelect = (addressData) => {
    setSelectedAddress(addressData.address);
    setLocation({
      latitude: addressData.latitude,
      longitude: addressData.longitude,
    });
  };

  useEffect(() => {
    if (location) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, fuelType, priority]);

  const handleSearch = async () => {
    if (!location) return;

    setLoading(true);
    setError('');

    try {
      const response = await searchStations({
        latitude: location.latitude,
        longitude: location.longitude,
        fuel_type: fuelType,
        priority: priority,
        radius: 5000,
      });

      setStations(response.data.stations);
      
      // Fetch recommendation after stations are loaded
      if (response.data.stations.length > 0) {
        fetchRecommendation(response.data.stations, fuelType);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch gas stations');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendation = async (stationsList, fuelTypeParam) => {
    setLoadingRecommendation(true);
    try {
      const response = await getRecommendation({
        stations: stationsList,
        fuel_type: fuelTypeParam
      });
      setRecommendation(response.data.recommendation);
    } catch (err) {
      console.error('Error fetching recommendation:', err);
      // Don't show error to user, just skip recommendation
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleToggleMap = async (station) => {
    try {
      // Toggle map visibility
      if (showMapForStation === station.id) {
        setShowMapForStation(null);
      } else {
        setShowMapForStation(station.id);
      }
    } catch (err) {
      console.error('Error getting navigation URL:', err);
    }
  };

  const handleNavigate = (station) => {
    if (!location) return;
    
    // Open Google Maps with directions in a new tab
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${station.latitude},${station.longitude}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  const openPriceUpdateModal = (station) => {
    setSelectedStation(station);
    setPriceUpdateModal(true);
    setNewPrice(station.price.toString());
  };

  const handleUpdatePrice = async () => {
    if (!selectedStation || !newPrice) return;

    try {
      const response = await updateStationPrice(selectedStation.id, {
        fuel_type: fuelType,
        price: parseFloat(newPrice),
      });

      console.log('Price update response:', response);
      alert('Price updated successfully!');
      
      // Update the station price in the UI without refreshing
      setStations(prevStations => 
        prevStations.map(s => 
          s.id === selectedStation.id 
            ? { ...s, price: parseFloat(newPrice), price_source: 'USER' }
            : s
        )
      );
      
      setPriceUpdateModal(false);
    } catch (err) {
      console.error('Error updating price:', err);
      console.error('Error response:', err.response);
      alert(`Failed to update price: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="dashboard">
      <ApiKeyDiagnostics />
      <header className="dashboard-header">
        <div className="dashboard-logo">🚗 CheapFuel</div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button className="btn btn-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Terms of Use & Privacy Policy Banner */}
      <div style={{
        backgroundColor: '#f3f4f6',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 24px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
      onClick={() => setBannerExpanded(!bannerExpanded)}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
          }}>
            <span style={{
              fontSize: '18px',
              transition: 'transform 0.2s',
              transform: bannerExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'inline-block',
            }}>
              ▼
            </span>
            Terms Of Use & Privacy Policy
          </div>
        </div>
      </div>
      
      {/* Expanded Banner Content */}
      {bannerExpanded && (
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '20px 24px',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#6b7280',
          }}>
            <p>In using this app, you agree to have read and understood the following:{'\n'}</p>
            <ul style={{ marginTop: '10px' }}>
              <li><strong>Data Sources:</strong> The location, gas prices, and ratings are <strong>synthetic data</strong> that are either randomly generated or statically set in the 'dummy_data' folder in the code repository.</li>
              <li><strong>Data Storage:</strong> Login credentials are only stored for a maximum of <strong>24 hours</strong> in a Supabase (PostgreSQL) database. No other PII information is stored. The only other information stored are in Google logs for debugging purposes.</li>
              <li><strong>Data Deletion:</strong> The completely data is deleted every 12mn UTC.</li>
            </ul>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="search-section">
          <h2 className="search-title">Find Cheap Gas Stations</h2>

          <div className="form-group">
            <label className="form-label">📍 Your Location</label>
            <AddressAutocomplete 
              onAddressSelect={handleAddressSelect}
              placeholder="Enter your starting address..."
            />
            {selectedAddress && (
              <p style={{
                marginTop: '8px',
                fontSize: '14px',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ✓ {selectedAddress}
              </p>
            )}
          </div>

          <div className="search-controls-row">
            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select
                className="form-select"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              >
                <option value="Regular">Regular</option>
                <option value="Premium">Premium</option>
                <option value="Diesel">Diesel</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="priority-buttons">
                <button
                  className={`priority-btn ${priority === 'price' ? 'active' : ''}`}
                  onClick={() => setPriority('price')}
                >
                  💰 Cheapest Price
                </button>
                <button
                  className={`priority-btn ${priority === 'time' ? 'active' : ''}`}
                  onClick={() => setPriority('time')}
                >
                  ⚡ Fastest Arrival
                </button>
                <button
                  className={`priority-btn ${priority === 'distance' ? 'active' : ''}`}
                  onClick={() => setPriority('distance')}
                >
                  📍 Shortest Distance
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation Section */}
        {!loading && stations.length > 0 && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              color: '#166534',
              fontSize: '18px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💡 Recommendation
            </h3>
            {loadingRecommendation ? (
              <div style={{
                color: '#65a30d',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                ⏳ Getting personalized recommendation...
              </div>
            ) : recommendation ? (
              <p style={{
                margin: 0,
                color: '#166534',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                {recommendation}
              </p>
            ) : null}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="results-section">
          <div className="results-header">
            <h2 className="results-title">Nearby Stations</h2>
            {stations.length > 0 && (
              <span className="results-count">{stations.length} stations found</span>
            )}
          </div>

          {loading ? (
            <div className="loading">🔍 Searching for gas stations...</div>
          ) : stations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⛽</div>
              <p className="empty-message">No gas stations found</p>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="station-list">
              {stations.map((station) => (
                <div key={station.id} className="station-card">
                  <div className="station-header">
                    <div className="station-info">
                      <h3 className="station-name">{station.name}</h3>
                      <p className="station-address">{station.address}</p>
                    </div>
                    <div className="station-price">
                      <div className="price-amount">₱{station.price.toFixed(2)}</div>
                      <div className="price-label">per liter</div>
                      <span className={`price-source ${station.price_source.toLowerCase()}`}>
                        {station.price_source === 'DOE' ? 'DOE Baseline' : 'User Updated'}
                      </span>
                    </div>
                  </div>

                  <div className="station-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>{station.distance_km} km away</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🕐</span>
                      <span>{station.duration_min} min drive</span>
                    </div>
                    {station.rating && (
                      <div className="detail-item">
                        <span className="detail-icon">⭐</span>
                        <span>{station.rating} ({station.user_ratings_total} reviews)</span>
                      </div>
                    )}
                  </div>

                  <div className="station-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleToggleMap(station)}
                    >
                      {showMapForStation === station.id ? '❌ Close Map' : '🗺️ Show Map'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleNavigate(station)}
                    >
                      🧭 Navigate
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openPriceUpdateModal(station)}
                    >
                      💵 Update Price
                    </button>
                  </div>

                  {/* Embedded Map */}
                  {showMapForStation === station.id && location && (
                    <div style={{
                      marginTop: '16px',
                      width: '100%',
                      height: '400px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '2px solid #e5e7eb'
                    }}>
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'}&origin=${location.latitude},${location.longitude}&destination=${station.latitude},${station.longitude}&mode=driving`}
                        allowFullScreen
                        title={`Map to ${station.name}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Update Modal */}
      {priceUpdateModal && selectedStation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
          }}>
            <h3 style={{ marginBottom: '20px' }}>Update Price</h3>
            <p style={{ marginBottom: '16px', color: '#6b7280' }}>
              {selectedStation.name}
            </p>
            <div className="form-group">
              <label className="form-label">New Price (₱ per liter)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="65.50"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                className="btn btn-primary"
                onClick={handleUpdatePrice}
                style={{ flex: 1 }}
              >
                Update
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setPriceUpdateModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

