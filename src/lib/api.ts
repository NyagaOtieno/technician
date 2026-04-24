import axios from "axios";

// =========================
// BASE CONFIG
// =========================
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://technician-production-0728.up.railway.app/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// =========================
// REQUEST INTERCEPTOR
// (attach token automatically)
// =========================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =========================
// RESPONSE INTERCEPTOR
// (better debugging on Vercel)
// =========================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "API Error";

    console.error("API ERROR:", message);

    return Promise.reject(new Error(message));
  }
);

// =========================
// AUTH / SESSIONS
// =========================
export const loginTechnician = async (userId: number) => {
  const res = await api.post("/sessions/login", { userId });
  return res.data;
};

export const logoutTechnician = async (userId: number) => {
  const res = await api.post("/sessions/logout", { userId });
  return res.data;
};

export const getOnlineUsers = async () => {
  const res = await api.get("/sessions/online");
  return res.data;
};

// =========================
// JOBS (optional but useful)
// =========================
export const getJobs = async () => {
  const res = await api.get("/jobs");
  return res.data;
};

export const updateJob = async (id: number, data: any) => {
  const res = await api.put(`/jobs/update/${id}`, data);
  return res.data;
};

export const createJob = async (data: any) => {
  const res = await api.post("/jobs", data);
  return res.data;
};

// =========================
// EXPORT DEFAULT (still usable)
// =========================
export default api;