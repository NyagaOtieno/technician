import axios from "axios";

export const api = axios.create({
  baseURL: "https://technician-production-0728.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});
