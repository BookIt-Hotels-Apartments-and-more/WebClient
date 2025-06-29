import {axiosInstance} from "./axios";

export const getAllBookings = async () => {
  const res = await axiosInstance.get("/api/bookings");
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await axiosInstance.get(`/api/bookings/${id}`);
  return res.data;
};

export const createBooking = async (bookingData) => {
  const res = await axiosInstance.post("/api/bookings", bookingData);
  return res.data;
};

export const updateBooking = async (id, bookingData) => {
  const res = await axiosInstance.put(`/api/bookings/${id}`, bookingData);
  return res.data;
};

export const checkInBooking = async (id) => {
  const res = await axiosInstance.patch(`/api/bookings/check-in/${id}`);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await axiosInstance.delete(`/api/bookings/${id}`);
  return res.data;
};

