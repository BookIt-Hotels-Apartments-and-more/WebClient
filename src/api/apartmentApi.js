import { axiosInstance } from "./axios";

export const fetchApartments = async () => {
  const res = await axiosInstance.get("/apartments");
  return res.data;
};

export const fetchApartmentById = async (id) => {
  const res = await axiosInstance.get(`/apartments/${id}`);
  return res.data;
};

export const createApartment = async (data) => {
  const res = await axiosInstance.post("/apartments", data);
  return res.data;
};

export const getApartmentById = async (id) => {
  const res = await axiosInstance.get(`/apartments/${id}`);
  return res.data;
};

export const getApartmentsByEstablishment = async (establishmentId) => {
  const res = await axiosInstance.get(`/apartments/by-establishment/${establishmentId}`);
  return res.data;
};

export const deleteApartment = async (id) => {
  const res = await axiosInstance.delete(`/apartments/${id}`);
  return res.data;
};

export const updateApartment = async (id, data) => {
  const res = await axiosInstance.put(`/apartments/${id}`, data);
  return res.data;
};



