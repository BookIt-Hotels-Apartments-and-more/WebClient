import { axiosInstance } from "./axios";

// Отримати список всіх квартир
export const fetchApartments = async () => {
  const res = await axiosInstance.get("/apartments");
  return res.data;
};

// Отримати одну квартиру по ID
export const fetchApartmentById = async (id) => {
  const res = await axiosInstance.get(`/apartments/${id}`);
  return res.data;
};

// Створити нову квартиру (для landlord)
export const createApartment = async (data) => {
  const res = await axiosInstance.post("/apartments", data);
  return res.data;
};
