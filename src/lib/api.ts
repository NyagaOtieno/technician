import axios from "axios";

// =========================
// BASE CONFIG (PRODUCTION SAFE)
// =========================

// IMPORTANT:
// Use /api when deployed with Vercel rewrite proxy
// Fallback to Railway directly for local dev or if proxy is not used

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "/api"; // ✅ IMPORTANT FIX (works with Vercel rewrites)

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// =========================
// REQUEST INTERCEPTOR
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
// SESSIONS API
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
// JOBS API
// =========================
export const getJobs = async () => {
  const res = await api.get("/jobs");
  return res.data;
};

export const createJob = async (data: any) => {
  const res = await api.post("/jobs", data);
  return res.data;
};

export const updateJob = async (id: number, data: any) => {
  const res = await api.put(`/jobs/update/${id}`, data);
  return res.data;
};

// =========================
// DEFAULT EXPORT
// =========================
export default api;