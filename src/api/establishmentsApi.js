import {axiosInstance} from "./axios";

export const createEstablishment = async (data) => {
  const res = await axiosInstance.post("/establishments", data);
  return res.data;
};

export const getEstablishmentsByOwner = async (ownerId) => {
  const res = await axiosInstance.get(`/establishments/owner/${ownerId}`);
  return res.data;
};

export const deleteEstablishment = async (id) => {
  const res = await axiosInstance.delete(`/establishments/${id}`);
  return res.data;
};

export const getEstablishmentById = async (id) => {
  const res = await axiosInstance.get(`/establishments/${id}`);
  return res.data;
};

export const updateEstablishment = async (id, data) => {
  const res = await axiosInstance.put(`/establishments/${id}`, data);
  return res.data;
};

export const getAllEstablishments = async () => {
  const res = await axiosInstance.get("/establishments");
  return res.data;
};


