import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: "https://bookit.pp.ua/",
  //baseURL: "http://localhost:5173/",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
 } else {
   if (config.headers && 'Authorization' in config.headers) {
     delete config.headers.Authorization;
   }
  }
  return config;
});

