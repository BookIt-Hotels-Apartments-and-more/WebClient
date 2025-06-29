import {axiosInstance} from "./axios";

export const getUserFavorites = async (userId) => {
  const res = await axiosInstance.get(`/api/favorites/user/${userId}`);
  return res.data;
};

export const addFavorite = async ({ userId, apartmentId }) => {
  const res = await axiosInstance.post(`/api/favorites`, { userId, apartmentId });
  return res.data;
};

export const removeFavorite = async (favoriteId) => {
  await axiosInstance.delete(`/api/favorites/${favoriteId}`);
};

