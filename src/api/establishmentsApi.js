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




