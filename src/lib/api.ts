import axios from "axios";

const api = axios.create({
  baseURL: "https://technician-production-0728.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
