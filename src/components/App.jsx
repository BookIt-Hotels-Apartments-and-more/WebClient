import AppRouter from '../router/AppRouter';
import { useState, useEffect } from "react";
import { setUser } from "../store/slices/userSlice";
import { axiosInstance } from "../api/axios"; 
import { useDispatch, useSelector } from "react-redux";




const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user); // ⬅️ читаємо user
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (user?.id) {
          setIsLoading(false); // ⬅️ вже є user — нічого не робимо
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
          console.error("Помилка завантаження користувача:", err);
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

  if (isLoading) return null; // або <Loader />

  return (
    <div className="main-content">
      <AppRouter />
    </div>
  );
};

export default App;