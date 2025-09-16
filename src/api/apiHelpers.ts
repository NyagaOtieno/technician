import { api } from "./apiClient";

// Jobs
export const getJobs = () => api.get("/jobs").then(res => res.data);
export const createJob = (job: any) => api.post("/jobs", job).then(res => res.data);

// Sessions
export const loginTechnician = (userId: number) => api.post("/sessions/login", { userId }).then(res => res.data);
export const logoutTechnician = (userId: number) => api.post("/sessions/logout", { userId }).then(res => res.data);
export const getOnlineUsers = () => api.get("/sessions/online").then(res => res.data);

// Reports
export const getWeeklyReport = (region: string) => api.get(`/reports/weekly?region=${region}`).then(res => res.data);

// Roll Call
export const takeRollCall = (region: string) => api.post("/rollcall", { region }).then(res => res.data);
export const getRollCallHistory = () => api.get("/rollcall").then(res => res.data);
