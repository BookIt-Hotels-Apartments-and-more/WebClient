import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {axiosInstance} from "../api/axios";
import { getCurrentUser } from "../api/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      axiosInstance.defaults.headers["Authorization"] = `Bearer ${token}`;
      console.log("TOKEN from Google:", token);

      getCurrentUser().then(user => {
        console.log("USER from /auth/me:", user);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(setUser(user));
        navigate("/");
      });
    }
  }, [dispatch, navigate]);

  return <div>Logging in...</div>;
};

export default AuthSuccess;
