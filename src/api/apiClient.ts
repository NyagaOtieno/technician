import axios from "axios";

export const api = axios.create({
  baseURL: "https://technician-production-e311.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});
