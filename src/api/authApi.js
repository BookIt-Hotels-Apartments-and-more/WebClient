import { axiosInstance } from "./axios";

export const loginUser = async (data) => {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
};

export const loginWithGoogle = async (token) => {
  const res = await axiosInstance.post("/auth/google", { token });
  return res.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null; 

  const res = await axiosInstance.get("/auth/me");
  return res.data;
};

export const generateResetToken = async (email) => {
  const res = await axiosInstance.post("/auth/reset-password/generate-token", { email });
  return res.data;
};

export const resetPassword = async ({ token, newPassword }) => {
  const res = await axiosInstance.post("/auth/reset-password", { token, newPassword });
  return res.data;
};


