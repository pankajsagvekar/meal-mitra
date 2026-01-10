import axios from "axios";

const api = axios.create({
  baseURL: "https://meal-mitra.onrender.com",
  withCredentials: true,
});

export default api;
