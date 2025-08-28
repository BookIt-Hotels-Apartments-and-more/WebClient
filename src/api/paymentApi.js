import {axiosInstance} from "./axios";

export const getAllPayments = async () => {
  const res = await axiosInstance.get("/api/Payment");
  return Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
};

// Створення оплати (універсально)
export const createPayment = (payment) =>
  axiosInstance.post(`/api/Payment`, payment);

export const createUniversalPayment = (payment) =>
  axiosInstance.post(`/api/Payment/universal`, payment);

export const checkMonoPaymentStatus = (data) =>
  axiosInstance.post(`/api/Payment/mono-status`, data);

export const manualConfirmPayment = (paymentId) =>
  axiosInstance.post(`/api/Payment/manual-confirm`, { paymentId });
