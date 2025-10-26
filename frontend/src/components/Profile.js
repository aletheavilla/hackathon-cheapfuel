import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../services/api";

function Profile({ user, setUser, onLogout }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    car_make: user?.car_make || "",
    car_model: user?.car_model || "",
    fuel_type: user?.fuel_type || "Regular",
    fuel_consumption: user?.fuel_consumption || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await updateProfile(formData);
      const updatedUser = response.data.user;

      // Update local storage and state
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <header className="dashboard-header">
        <div className="dashboard-logo">🚗 CheapFuel</div>
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
          <button className="btn btn-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <h1 className="profile-title">My Profile</h1>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div
              style={{
                backgroundColor: "#d1fae5",
                color: "#065f46",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={user?.email}
                disabled
                style={{ backgroundColor: "#f3f4f6" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Car Make</label>
              <input
                type="text"
                name="car_make"
                className="form-input"
                value={formData.car_make}
                onChange={handleChange}
                placeholder="e.g., Toyota, Honda, Ford"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Car Model</label>
              <input
                type="text"
                name="car_model"
                className="form-input"
                value={formData.car_model}
                onChange={handleChange}
                placeholder="e.g., Corolla, Civic, F-150"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Fuel Type</label>
              <select
                name="fuel_type"
                className="form-select"
                value={formData.fuel_type}
                onChange={handleChange}
              >
                <option value="Regular">Regular</option>
                <option value="Premium">Premium</option>
                <option value="Diesel">Diesel</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Estimated Fuel Consumption (km/l)
              </label>
              <input
                type="number"
                name="fuel_consumption"
                className="form-input"
                value={formData.fuel_consumption}
                onChange={handleChange}
                placeholder="e.g., 12.5"
                step="0.1"
                min="0"
              />
              <small
                style={{
                  color: "#6b7280",
                  fontSize: "0.875rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Enter your car's average fuel consumption in kilometers per
                liter
              </small>
            </div>

            <button type="submit" className="form-button" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
