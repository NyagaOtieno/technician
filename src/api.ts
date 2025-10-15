import axios, { AxiosInstance } from "axios";

const BASE_URL = "https://technician-production-e311.up.railway.appsss/api";

// Create a centralized Axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ===== Jobs =====
export async function getAllJobs() {
  const res = await api.get("/jobs");
  return res.data;
}

export async function createJob(jobData: {
  vehicleReg: string;
  jobType: string;
  status: string;
  scheduledDate: string;
  location: string;
  technicianId: number;
}) {
  const res = await api.post("/jobs", jobData);
  return res.data;
}

// ===== Sessions =====
export async function loginTechnician(userId: number) {
  const res = await api.post("/sessions/login", { userId });
  // Store token if returned
  if (res.data?.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
}

export async function logoutTechnician(userId: number) {
  const res = await api.post("/sessions/logout", { userId });
  // Remove token on logout
  localStorage.removeItem("token");
  return res.data;
}

export async function getOnlineUsers() {
  const res = await api.get("/sessions/online");
  return res.data;
}

// ===== Reports =====
export async function getWeeklyReport(region: string) {
  const res = await api.get("/reports/weekly", { params: { region } });
  return res.data;
}

// ===== Roll Call =====
export async function takeRollCall(region: string) {
  const res = await api.post("/rollcall", { region });
  return res.data;
}

export async function getRollCallHistory() {
  const res = await api.get("/rollcall");
  return res.data;
}

// ===== User Authentication =====
export async function loginUser(data: { email: string; password: string }) {
  const res = await api.post("/auth/login", data);
  if (res.data?.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
}

export async function registerUser(data: { name: string; email: string; password: string; role: string }) {
  const res = await api.post("/auth/register", data);
  return res.data;
}

export async function logoutUser() {
  const res = await api.post("/auth/logout");
  localStorage.removeItem("token");
  return res.data;
}
