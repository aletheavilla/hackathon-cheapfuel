import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    car_make: '',
    car_model: '',
    fuel_type: 'Regular',
    fuel_consumption: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting registration with:', formData);
      const response = await register(formData);
      console.log('Registration response:', response);
      onRegister(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      setError(err.response?.data?.message || err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">🚗 CheapFuel</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Car Make (Optional)</label>
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
            <label className="form-label">Car Model (Optional)</label>
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
            <label className="form-label">Estimated Fuel Consumption (km/l) (Optional)</label>
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
          </div>

          <button type="submit" className="form-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

