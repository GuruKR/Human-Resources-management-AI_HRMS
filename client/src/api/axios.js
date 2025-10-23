import axios from "axios";

// Base URL (uses env if available, otherwise defaults to localhost)
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Automatically attach JWT token (if logged in)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Optional: Auto-handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export { API };
export default api;
