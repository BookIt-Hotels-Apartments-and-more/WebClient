import {axiosInstance} from "./axios";

export const getUserFavorites = async (userId) => {
  const res = await axiosInstance.get(`/favorites/user/${userId}`);
  return res.data;
};
