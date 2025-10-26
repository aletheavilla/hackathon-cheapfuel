import axios from 'axios';

// In development with proxy, use relative URLs
// In production, use full URL from environment
const API_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:8080/api')
  : '/api';

console.log('Environment:', process.env.NODE_ENV);
console.log('API configured to use:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  console.log('Making request to:', config.baseURL + config.url);
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Error Response:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = (data) => api.post('/register', data);
export const login = (data) => api.post('/login', data);
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

// Station APIs
export const searchStations = (data) => api.post('/stations/search', data);
export const updateStationPrice = (stationId, data) => api.post(`/stations/${stationId}/price`, data);
export const getNavigationUrl = (stationId) => api.get(`/stations/${stationId}/navigate`);
export const getRecommendation = (data) => api.post('/stations/recommendation', data);

// Admin APIs
export const seedPrices = () => api.post('/admin/seed-prices');

export default api;

