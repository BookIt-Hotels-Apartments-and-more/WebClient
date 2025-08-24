import { axiosInstance } from "./axios";

export const getUserFavorites = async () => {
  const res = await axiosInstance.get(`/api/favorites/my`);
  return res.data;
};

export const addFavorite = async ({ userId, establishmentId }) => {
  const res = await axiosInstance.post(`/api/favorites`, { userId, establishmentId });
  return res.data;
};

export const removeFavorite = async (favoriteId) => {
  await axiosInstance.delete(`/api/favorites/${favoriteId}`);
};

export const getAllFavorites = async () => {
  const res = await axiosInstance.get(`/api/favorites`);
  return res.data;
};

export const getFavoriteById = async (favoriteId) => {
  const res = await axiosInstance.get(`/api/favorites/${favoriteId}`);
  return res.data;
};

export const getFavoritesByEstablishment = async (establishmentId) => {
  const res = await axiosInstance.get(`/api/favorites/establishment/${establishmentId}`);
  return res.data;
};
