import {axiosInstance} from "./axios";

export const getAllReviews = async () => {
  const res = await axiosInstance.get("/api/reviews");
  return res.data;
};

export const getReviewById = async (id) => {
  const res = await axiosInstance.get(`/api/reviews/${id}`);
  return res.data;
};

export const createReview = async (reviewData) => {
  const res = await axiosInstance.post("/api/reviews", reviewData);
  return res.data;
};

export const updateReview = async (id, reviewData) => {
  const res = await axiosInstance.put(`/api/reviews/${id}`, reviewData);
  return res.data;
};

export const deleteReview = async (id) => {
  const res = await axiosInstance.delete(`/api/reviews/${id}`);
  return res.data;
};
