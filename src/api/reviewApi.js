import {axiosInstance} from "./axios";

export const getAllReviews = async () => {
  const res = await axiosInstance.get("/reviews");
  return res.data;
};

export const getReviewById = async (id) => {
  const res = await axiosInstance.get(`/reviews/${id}`);
  return res.data;
};

export const createReview = async (reviewData) => {
  const res = await axiosInstance.post("/reviews", reviewData);
  return res.data;
};

export const updateReview = async (id, reviewData) => {
  const res = await axiosInstance.put(`/reviews/${id}`, reviewData);
  return res.data;
};

export const deleteReview = async (id) => {
  const res = await axiosInstance.delete(`/reviews/${id}`);
  return res.data;
};
