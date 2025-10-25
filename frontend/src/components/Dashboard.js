import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchStations, getNavigationUrl, updateStationPrice } from '../services/api';

function Dashboard({ user, onLogout }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fuelType, setFuelType] = useState(user?.fuel_type || 'Regular');
  const [priority, setPriority] = useState('price');
  const [location, setLocation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [priceUpdateModal, setPriceUpdateModal] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Manila coordinates
          setLocation({
            latitude: 14.5995,
            longitude: 120.9842,
          });
        }
      );
    } else {
      // Default to Manila coordinates
      setLocation({
        latitude: 14.5995,
        longitude: 120.9842,
      });
    }
  }, []);

  useEffect(() => {
    if (location) {
      handleSearch();
    }
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch gas stations');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = async (stationId) => {
    try {
      const response = await getNavigationUrl(stationId);
      window.open(response.data.navigation_url, '_blank');
    } catch (err) {
      console.error('Error getting navigation URL:', err);
    }
  };

  const openPriceUpdateModal = (station) => {
    setSelectedStation(station);
    setPriceUpdateModal(true);
    setNewPrice(station.price.toString());
  };

  const handleUpdatePrice = async () => {
    if (!selectedStation || !newPrice) return;

    try {
      await updateStationPrice(selectedStation.id, {
        fuel_type: fuelType,
        price: parseFloat(newPrice),
      });

      alert('Price updated successfully!');
      setPriceUpdateModal(false);
      handleSearch(); // Refresh the list
    } catch (err) {
      alert('Failed to update price');
    }
  };

  return (
    <div className="dashboard">
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

      <div className="dashboard-content">
        <div className="search-section">
          <h2 className="search-title">Find Cheap Gas Stations</h2>

          <div className="search-controls">
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
                      onClick={() => handleNavigate(station.id)}
                    >
                      🗺️ Navigate
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openPriceUpdateModal(station)}
                    >
                      💵 Update Price
                    </button>
                  </div>
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

