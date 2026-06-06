import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",   // Backend URL
  timeout: 10000,
});

// Optional: Token agar future mein customer auth add karna ho
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("customer_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});