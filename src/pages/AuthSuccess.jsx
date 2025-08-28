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

    localStorage.setItem("token", token);
    axiosInstance.defaults.headers["Authorization"] = `Bearer ${token}`;

    getCurrentUser()
      .then((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(setUser(user));
        navigate('/');
      })
      .catch(() => {
        console.error('Auth error.');
        navigate('/login');
      });
  }, [dispatch, navigate]);

  return <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "end",
      alignContent: "center",
      padding: "20px",
      height: "40dvh",
      textAlign: "center"
    }}>
      Logging in...
    </div>;
};

export default AuthSuccess;
