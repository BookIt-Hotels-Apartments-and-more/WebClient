import {axiosInstance} from "./axios";

export const getAllUsers = async () => {
  const res = await axiosInstance.get("/api/user");
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axiosInstance.get(`/api/user/${id}`);
  return res.data;
};

export const getUserImages = async () => {
  const res = await axiosInstance.get("/api/userManagement/images");
  return res.data;
};

export const deleteUserImages = async () => {
  await axiosInstance.delete("/api/userManagement/all-images");
};

export const uploadUserPhoto = async (base64string) => {
  await axiosInstance.put(
    `/api/userManagement/images`,
    {
      existingPhotosIds: [],
      newPhotosBase64: [base64string],
    },
  );
};

export const updateUserDetails = async (data) => {
  const body = {
    username: data.username,
    email: data.email,
    phoneNumber: data.phoneNumber,
    bio: data.bio,
  };
  await axiosInstance.put("/api/userManagement/details", body);
};

export const updateUserPassword = async (currentPassword, newPassword) => {
  const body = {
    currentPassword,
    newPassword,
  };
  await axiosInstance.put("/api/userManagement/password", body);
};

