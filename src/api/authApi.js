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
  const res = await axiosInstance.get("/auth/me");
  return res.data;
};
