import axios from 'axios';

const BASE_URL = 'https://jendietech-production.up.railway.app/api';

// ====== Jobs ======
export const getAllJobs = async () => {
  const res = await axios.get(`${BASE_URL}/jobs`);
  return res.data;
};

export const createJob = async (jobData) => {
  const res = await axios.post(`${BASE_URL}/jobs`, jobData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

// ====== Sessions ======
export const loginTechnician = async (userId) => {
  const res = await axios.post(`${BASE_URL}/sessions/login`, { userId });
  return res.data;
};

export const logoutTechnician = async (userId) => {
  const res = await axios.post(`${BASE_URL}/sessions/logout`, { userId });
  return res.data;
};

export const getOnlineUsers = async () => {
  const res = await axios.get(`${BASE_URL}/sessions/online`);
  return res.data;
};

// ====== Reports ======
export const getWeeklyReport = async (region) => {
  const res = await axios.get(`${BASE_URL}/reports/weekly`, { params: { region } });
  return res.data;
};

// ====== Roll Call ======
export const takeRollCall = async (region) => {
  const res = await axios.post(`${BASE_URL}/rollcall`, { region });
  return res.data;
};

export const getRollCallHistory = async () => {
  const res = await axios.get(`${BASE_URL}/rollcall`);
  return res.data;
};
