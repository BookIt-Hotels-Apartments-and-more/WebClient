import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { getCurrentUser } from "../api/authApi";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem("token", token);

    getCurrentUser()
      .then((userData) => {
        dispatch(setUser(userData));
        navigate("/");
      })
       .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [dispatch, navigate]);

  return <div style={{ padding: "2rem", textAlign: "center" }}>Login successful, redirecting...</div>;
};

export default AuthSuccess;
