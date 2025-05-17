import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../locales/translations";


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const { language } = useLanguage();
  const t = translations[language];


  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.includes("@")) {
      alert("Введіть коректну пошту");
      return;
    }

    fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Помилка реєстрації");
        return res.json();
      })
      .then((data) => {
        console.log("Зареєстровано:", data);
        navigate("/login");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Помилка Google реєстрації");
        return res.json();
      })
      .then((data) => {
        console.log("Google зареєстровано:", data);
        navigate("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t.register}</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <input
                  type="text"
                  name="fullName"
                  className="form-control mb-3"
                  placeholder={t.placeholderFullName}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  className="form-control mb-3"
                  placeholder={t.placeholderPhone}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  className="form-control mb-3"
                  placeholder={t.placeholderEmail}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <input
                  type="password"
                  name="password"
                  className="form-control mb-3"
                  placeholder={t.placeholderPassword}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />


              <div className="text-center mt-4">
                <p>{t.registerWithGoogle}</p>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => alert("Google авторизація не вдалася")}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-dark w-100">
                {t.register}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
