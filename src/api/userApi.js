import {axiosInstance} from "./axios";

export const getAllUsers = async () => {
  const res = await axiosInstance.get("/users"); // надеюсь потом будет такой метод
  return res.data;
};

export const deleteUser = async (id) => {
  await axiosInstance.delete(`/users/${id}`);
};

export const uploadUserPhoto = async (photoBase64) => {
  const payload = {
    newPhotosBase64: [photoBase64],
    existingPhotosIds: []
  };
  await axiosInstance.put("/user/images", payload);
};
