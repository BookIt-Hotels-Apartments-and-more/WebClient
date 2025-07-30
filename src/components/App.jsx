window.addEventListener('beforeunload', () => {
  localStorage.removeItem('bookingForm');
});
import AppRouter from '../router/AppRouter';
import { useState, useEffect } from "react";
import { setUser } from "../store/slices/userSlice";
import { axiosInstance } from "../api/axios"; 
import { useDispatch, useSelector } from "react-redux";
import 'leaflet/dist/leaflet.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




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
        //console.log("USER DATA:", res.data.user);
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
      <ToastContainer position="top-center" autoClose={10000 } />
    </div>
    
  );
};

export default App;