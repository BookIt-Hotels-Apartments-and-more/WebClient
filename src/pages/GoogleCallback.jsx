import { useEffect } from "react";
import { axiosInstance } from "../api/axios";

const GoogleCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      window.location.href = `${axiosInstance.defaults.baseURL}google-auth/callback?code=${code}`;
    } else {
      alert("Authorization code not found");
    }
  }, []);

  return <p>Waiting for Google authorization to complete...</p>;
};

export default GoogleCallback;
