import {axiosInstance} from "./axios";

export const getAllUsers = async () => {
  const res = await axiosInstance.get("/users"); // надеюсь потом будет такой метод
  return res.data;
};

export const deleteUser = async (id) => {
  await axiosInstance.delete(`/users/${id}`);
};
