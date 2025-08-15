import {axiosInstance} from "./axios";

export const getAllEstablishments = async () => {
  const res = await axiosInstance.get("/api/Establishments");
  return res.data;
};

export const createEstablishment = async (data) => {
  const res = await axiosInstance.post("/api/Establishments", data);
  return res.data;
};

export const getEstablishmentsByOwner = async (ownerId) => {
  const res = await axiosInstance.get(`/api/Establishments/owner/${ownerId}`);
  return res.data;
};

export const deleteEstablishment = async (id) => {
  const res = await axiosInstance.delete(`/api/Establishments/${id}`);
  return res.data;
};

export const getEstablishmentById = async (id) => {
  const res = await axiosInstance.get(`/api/Establishments/${id}`);
  return res.data;
};

export const updateEstablishment = async (id, data) => {
  const res = await axiosInstance.put(`/api/Establishments/${id}`, data);
  return res.data;
};

export const getEstablishmentsFiltered = async (params = {}) => {
  const res = await axiosInstance.get("/api/Establishments/filter", { params });
  return res.data?.items ?? res.data;
};

export const getEstablishmentsByVibe = async (vibe) => {
  return getEstablishmentsFiltered({ vibe });
};

export const getEstablishmentsByOwnerFiltered = async (ownerId, filters = {}) => {
  const params = {
    ownerId,
    ...filters,
  };
  const res = await axiosInstance.get("/api/Establishments/filter", { params });
  return res.data.items;
};

export const getTrendingEstablishments = async (count = 5, pastDays = 30) => {
  const res = await axiosInstance.get("/api/Establishments/trending", {
    params: { count, pastDays },
  });
  return res.data;
};






