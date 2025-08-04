import {axiosInstance} from "./axios";

// Створення оплати (універсально: mono/cash/transfer)
export const createPayment = (payment) =>
  axiosInstance.post(`/api/Payment`, payment);

// Створення universal
export const createUniversalPayment = (payment) =>
  axiosInstance.post(`/api/Payment/universal`, payment);

// Перевірка статусу mono платежу
export const checkMonoPaymentStatus = (data) =>
  axiosInstance.post(`/api/Payment/mono-status`, data);

// Підтвердження manual
export const manualConfirmPayment = (paymentId) =>
  axiosInstance.post(`/api/Payment/manual-confirm`, { paymentId });
