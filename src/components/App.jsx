import AppRouter from '../router/AppRouter';
import { useState, useEffect } from "react";
import { setUser } from "../store/slices/userSlice";
import { axiosInstance } from "../api/axios"; 
import { useDispatch, useSelector } from "react-redux";




const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (user?.id) {
          setIsLoading(false);
          return;
        }

        const res = await axiosInstance.get("/auth/me");
        if (res?.data?.user) {
          dispatch(setUser(res.data.user));
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        if (err?.response?.status !== 401) {
          console.error("User upload error:", err);
        }
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchUser();
  }, [dispatch, user]);

  if (isLoading) return null;

  return (
    <div className="main-content">
      <AppRouter />
    </div>
  );
};

export default App;