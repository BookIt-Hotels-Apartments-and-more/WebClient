import { useEffect } from "react";
import { Link } from 'react-router-dom';
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../locales/translations";
import { useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa"; 
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import UserPanel from "../pages/tenant/UserPanel";
import LandPanel from "../pages/landlord/LandPanel";
import AdminPanel from "../pages/admin/AdminPanel";
import React, { useState } from 'react';





const Header = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
  if (showPanel) {
    document.body.classList.add("user-panel-open");
  } else {
    document.body.classList.remove("user-panel-open");
  }
  }, [showPanel]);


  const handleLogout = () => {
  localStorage.removeItem("token");
  dispatch(setUser(null));
  navigate("/");
};


  return (
  <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div className="container d-flex justify-content-between align-items-center">

      <Link to="/" className="navbar-brand fw-bold fs-3">🏠 BookIt.com 🚙</Link>

      {/* Кнопка для власника */}
      <Link to="/partner-auth" className="btn btn-outline-dark">
        {t.landlord}
      </Link>
      {/* Перевірка панелі */}
      <Link to="/landlordpanel" className="btn btn-dark">
        Панель партнера
      </Link>

      {/* Кнопка для адміна */}
      <Link to="/admin-auth" className="btn btn-outline-dark">
        {t.employees}
      </Link>

      {/* Перевірка панелі */}
      <Link to="/adminpanel" className="btn btn-dark">
        Адмінпанель
      </Link>

      <div className="d-flex align-items-center gap-2">
        {!user && (
          <>
            <Link to="/login" className="btn btn-outline-dark">{t.login}</Link>
            <Link to="/register" className="btn btn-dark">{t.register}</Link>
          </>
        )}

        {user && (!user.role || user.role === "Tenant") && (
          <div className="d-flex align-items-center gap-3">
            <FaUserCircle
              size={24}
              style={{ cursor: "pointer" }}
              onClick={() => setShowPanel(true)}
            />
            <span>{user?.username}</span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              {t.out}
            </button>
          </div>
        )}

        {user && (user.role === "Admin" || user.role === "Landlord") && (
          <div className="d-flex align-items-center gap-3">
            <span>{user?.username}</span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              {t.out}
            </button>
          </div>
        )}
      </div>

      <button className="btn btn-sm btn-outline-secondary" onClick={toggleLanguage}>
        {language === "uk" ? "EN" : "UK"}
      </button>
    </div>

    {/* Модалка тільки для Tenant */}
    {user && showPanel && (!user.role || user.role === "Tenant") && (
      <UserPanel user={user} onClose={() => setShowPanel(false)} />
    )}

  </nav>
);

};

export default Header;
