import {axiosInstance} from "./axios";

export const getAllEstablishments = async () => {
  try {
    const res = await axiosInstance.get("/api/Establishments");
    const data = res.data;
    return Array.isArray(data) ? data : (data?.items || []);
  } catch (err) {
    console.error("Error getAllEstablishments:", err);
    return [];
  }
};

export const createEstablishment = async (data) => {
  const res = await axiosInstance.post("/api/Establishments", data);
  return res.data;
};

export const getEstablishmentsByOwner = async (ownerId) => {
  const res = await axiosInstance.get(`/api/Establishments/owner/${ownerId}`);
  return res.data;
};

export const deleteEstablishment = async (id) => {
  const res = await axiosInstance.delete(`/api/Establishments/${id}`);
  return res.data;
};

export const getEstablishmentById = async (id) => {
  const res = await axiosInstance.get(`/api/Establishments/${id}`);
  return res.data;
};

export const updateEstablishment = async (id, data) => {
  const res = await axiosInstance.put(`/api/Establishments/${id}`, data);
  return res.data;
};

export const getEstablishmentsFiltered = async (params = {}) => {
  const res = await axiosInstance.get("/api/Establishments/filter", { params });
  return res.data?.items ?? res.data;
};

export const getEstablishmentsByVibe = async (vibe) => {
  return getEstablishmentsFiltered({ vibe });
};

export const getEstablishmentsByOwnerFiltered = async (ownerId, filters = {}) => {
  const params = {
    ownerId,
    ...filters,
  };
  const res = await axiosInstance.get("/api/Establishments/filter", { params });
  return res.data.items;
};

export const getTrendingEstablishments = async (count = 5, pastDays = 30) => {
  try {
    const res = await axiosInstance.get("/api/Establishments/trending", {
      params: { count, pastDays },
    });
    const data = res.data;
    return Array.isArray(data) ? data : (data?.items || []);
  } catch (e) {
    console.error("Trending failed (fallback to all):", e);
    try {
      const all = await axiosInstance.get("/api/Establishments");
      const list = Array.isArray(all.data) ? all.data : (all.data?.items || []);
      return list.slice(0, count);
    } catch (e2) {
      console.error("Fallback to all establishments also failed:", e2);
      return [];
    }
  }
};







