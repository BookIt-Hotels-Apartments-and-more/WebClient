import {axiosInstance} from "./axios";

export const getAllUsers = async () => {
  const res = await axiosInstance.get("/api//user");
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axiosInstance.get(`/api/user/${id}`);
  return res.data;
};

export const deleteUser = async (id) => {
  await axiosInstance.delete(`/api/user/${id}`);
};

export const uploadUserPhoto = async (base64string) => {
  const token = localStorage.getItem("token");
  await axiosInstance.put(
    `/user/images`,
    {
      existingPhotosIds: [],
      newPhotosBase64: [base64string],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

