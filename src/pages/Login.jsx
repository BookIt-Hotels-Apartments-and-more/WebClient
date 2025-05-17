import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../locales/translations";
import { loginUser } from "../api/authApi";
import { getCurrentUser } from "../api/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";



const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { language } = useLanguage();
  const t = translations[language];
  const dispatch = useDispatch();


  const handleClose = () => {
    navigate("/");
  };

  const handleEmailLogin = () => {
  if (!email.includes("@")) {
    alert("Введіть коректну пошту");
    return;
  }
  loginUser({ email, password })
    .then((data) => {
      localStorage.setItem("token", data.token); 
      return getCurrentUser(); 
    })
    .then((user) => {
      dispatch(setUser(user));
      navigate("/");
    })
    .catch((err) => {
      alert(err.message || "Невірний email або пароль");
    });
  };

  

  const handleGoogleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    fetch("https://your-backend.com/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Помилка входу через Google");
        return res.json();
      })
      .then((data) => {
        console.log("Користувач авторизований:", data);
        navigate("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t.login}</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
           <input
              type="email"
              className="form-control mb-3"
              placeholder={t.placeholderEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder={t.placeholderPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />


            <div className="text-center mt-4">
              <p>{t.loginWithGoogle}</p> 
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert("Google авторизація не вдалася")} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-dark w-100" onClick={handleEmailLogin}>
              {t.login}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
