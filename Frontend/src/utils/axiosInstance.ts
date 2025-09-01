import axios, { AxiosRequestHeaders } from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_HOST || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders; // ✅ cast properly
    }
    (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
