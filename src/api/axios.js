import axios from 'axios';

const token = localStorage.getItem("token");

export const axiosInstance = axios.create({
  baseURL: "https://localhost:7065",
  withCredentials: true,
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

