import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://meal-mitra.onrender.com",
  withCredentials: true,
});

export default api;
