import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
    : "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const register = (data) => api.post("/register", data);
export const login = (data) => api.post("/login", data);
export const getProfile = () => api.get("/profile");
export const updateProfile = (data) => api.put("/profile", data);

// Station APIs
export const searchStations = (data) => api.post("/stations/search", data);
export const updateStationPrice = (stationId, data) => api.post(`/stations/${stationId}/price`, data);
export const getNavigationUrl = (stationId) => api.get(`/stations/${stationId}/navigate`);
export const getRecommendation = (data) => api.post("/stations/recommendation", data);
export const geocodeAddress = (address) => api.post("/geocode", { address });

// Admin APIs
export const seedPrices = () => api.post("/admin/seed-prices");

export default api;


