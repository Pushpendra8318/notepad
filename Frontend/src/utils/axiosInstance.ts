import axios from "axios";

// Create a new Axios instance with a base URL and default headers.
// The base URL is set from an environment variable (VITE_HOST) for flexibility,
// falling back to http://localhost:5000 in development.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_HOST || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Use an interceptor to add the authentication token to every request header.
// This runs before each request is sent.
axiosInstance.interceptors.request.use((config) => {
  // Get the JWT token from local storage.
  const token = localStorage.getItem("token");
  
  // If a token exists, add it to the Authorization header in the format "Bearer <token>".
  if (token) {
    // Ensure the headers object exists before setting a new property.
    if (!config.headers) config.headers = {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // Return the modified configuration to proceed with the request.
  return config;
});

export default axiosInstance;
