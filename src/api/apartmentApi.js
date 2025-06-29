import { axiosInstance } from "./axios";

export const fetchApartments = async () => {
  const res = await axiosInstance.get("/api/apartments");
  return res.data;
};

export const fetchApartmentById = async (id) => {
  const res = await axiosInstance.get(`/api/apartments/${id}`);
  return res.data;
};

export const createApartment = async (data) => {
  const res = await axiosInstance.post("/api/apartments", data);
  return res.data;
};

export const getApartmentById = async (id) => {
  const res = await axiosInstance.get(`/api/apartments/${id}`);
  return res.data;
};

export const getApartmentsByEstablishment = async (establishmentId) => {
  const res = await axiosInstance.get(`/api/apartments`);
  return res.data.filter(a => a.establishment && a.establishment.id === establishmentId);
};

export const deleteApartment = async (id) => {
  const res = await axiosInstance.delete(`/api/apartments/${id}`);
  return res.data;
};

export const updateApartment = async (id, data) => {
  const res = await axiosInstance.put(`/api/apartments/${id}`, data);
  return res.data;
};



