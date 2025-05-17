import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../locales/translations";

const Header = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold fs-3">🏠 BookIt 🚙</Link>

        <div className="d-flex ms-auto align-items-center gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={toggleLanguage}>
            {language === "uk" ? "EN" : "UK"}
          </button>
          <Link to="/login" className="btn btn-outline-dark">{t.login}</Link>
          <Link to="/register" className="btn btn-dark">{t.register}</Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
