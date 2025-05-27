import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../locales/translations";
import { registerUser } from "../api/authApi";
import { useLocation } from "react-router-dom";



const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    //phone: "",
    email: "",
    password: "",
  });
  const { language } = useLanguage();
  const t = translations[language];
  const location = useLocation();
  const selectedRole = location.state?.role || "Tenant";



  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!formData.email.includes("@")) {
    alert("Введіть коректну пошту");
    return;
  }

    registerUser({
    username: formData.fullName,
    email: formData.email,
    password: formData.password,
    role: selectedRole,
    })
    .then((data) => {
      console.log("Зареєстровано:", data);
      alert("Ви успішно зареєстровані в нашому сервісі!");
      navigate("/login");
    })
    .catch((err) => {
      alert(err.message || "Помилка реєстрації");
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

                {/* <input
                  type="tel"
                  name="phone"
                  className="form-control mb-3"
                  placeholder={t.placeholderPhone}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                /> */}

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
               <button
                  onClick={() => {
                    window.location.href = "https://localhost:7065/google-auth/login";
                  }}
                >
                  Увійти через Google
                </button>
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
