import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../locales/translations";
import { loginUser } from "../api/authApi";
import { getCurrentUser } from "../api/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { forgotPassword } from "../api/authApi";




const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { language } = useLanguage();
  const t = translations[language];
  const dispatch = useDispatch();
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [message, setMessage] = useState("");



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
      console.log("👤 userData з логіна:", user);
      dispatch(setUser(user));

      if (user.role === "Landlord") {
        navigate("/landlordpanel");
      } else if (user.role === "Admin") {
        navigate("/adminpanel");
      } else {
        navigate("/");
      }
    })
    .catch((err) => {
      alert(err.message || "Невірний email або пароль");
    });
};

  const handleForgotPassword = async () => {
  if (!recoveryEmail.includes("@")) {
    alert("Введіть коректний email");
    return;
  }

  try {
    const res = await forgotPassword(recoveryEmail);
    setMessage(res.message || `Лист для відновлення пароля надіслано на ${recoveryEmail}`);
  } catch (err) {
    setMessage("Помилка при відновленні пароля.");
    console.error("❌ Forgot password error:", err);
  } finally {
    setRecoveryEmail("");
    setShowForgot(false);
  }
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

            <div className="text-end mb-3">
              <button
                className="btn btn-link p-0"
                onClick={() => setShowForgot(true)}
              >
                Забули пароль?
              </button>
            </div>

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
            <button className="btn btn-dark w-100" onClick={handleEmailLogin}>
              {t.login}
            </button>
          </div>
        </div>
      </div>

      {showForgot && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Відновлення пароля</h5>
                <button type="button" className="btn-close" onClick={() => setShowForgot(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Введіть email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary w-100" onClick={handleForgotPassword}>
                  Надіслати
                </button>
              </div>
            </div>
          </div>
          {message && <div className="alert alert-info text-center">{message}</div>}
        </div>
      )}

    </div>    
  );
};

export default Login;
