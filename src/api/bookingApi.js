import {axiosInstance} from "./axios";

export const getAllBookings = async () => {
  const res = await axiosInstance.get("/bookings");
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await axiosInstance.get(`/bookings/${id}`);
  return res.data;
};

export const createBooking = async (bookingData) => {
  const res = await axiosInstance.post("/bookings", bookingData);
  return res.data;
};

export const updateBooking = async (id, bookingData) => {
  const res = await axiosInstance.put(`/bookings/${id}`, bookingData);
  return res.data;
};

export const checkInBooking = async (id) => {
  const res = await axiosInstance.patch(`/bookings/check-in/${id}`);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await axiosInstance.delete(`/bookings/${id}`);
  return res.data;
};

export const getUserBookings = async (userId) => {
  const res = await axiosInstance.get(`/bookings/user/${userId}`);
  return res.data;
};
