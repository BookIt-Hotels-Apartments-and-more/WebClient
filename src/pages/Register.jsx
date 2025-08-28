import { useState } from "react";
import { axiosInstance } from "../api/axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { registerUser, registerLandlord } from "../api/authApi";
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const location = useLocation();
  const selectedRole = location.state?.role || localStorage.getItem("registerRole") || "Tenant";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validatePassword = (password, username = "") => {
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  let errors = [];
  if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("one number");
  if (!new RegExp(`[${specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(password))
    errors.push("one special character");
  if (/(.)\1\1/.test(password)) errors.push("no more than 2 identical characters in a row");
  if (username && password.toLowerCase().includes(username.toLowerCase()))
    errors.push("not contain your username");
  return errors;
};


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    const passwordErrors = validatePassword(formData.password, formData.fullName);
    if (passwordErrors.length > 0) {
      setError(
        "Password must contain at least " +
          passwordErrors.join(", ")
      );
      return;
    }

    const payload = {
      username: formData.fullName,
      email: formData.email,
      password: formData.password,
    };
    const apiCall = selectedRole === "Landlord" ? registerLandlord : registerUser;
    apiCall(payload)
      .then(() => {
        toast.error("You have successfully registered in our service!", { autoClose: 4000 });
        localStorage.removeItem("registerRole");
        navigate("/login");
      })
      .catch((err) => {
        setError(err.message || "Registration error");
      });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(255,255,255,0.95) 0%,
            rgba(255,255,255,0.10) 20%,
            rgba(255,255,255,0) 60%
          ),
          url('/images/signin.png')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 0",
        marginTop: "-110px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.65)",
          borderRadius: "24px",
          padding: "48px 32px 48px 32px",
          width: "90%",
          maxWidth: 1100,
          minWidth: 300,
          height: "auto",
          marginTop: 80,
          boxShadow: "0 4px 32px 0 rgba(31, 38, 135, 0.13)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Outline-текст зверху */}
        <div
          style={{
            width: "100%",
            maxWidth: 1150,
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontFamily: "'Sora', Arial, sans-serif",
              fontWeight: 700,
              fontSize: 60,
              lineHeight: 1.1,
              color: "transparent",
              WebkitTextStroke: "1.5px #fff",
              textStroke: "1.5px #fff",
              letterSpacing: "0px",
              display: "inline-block",
            }}
          >
            START YOUR JOURNEY WITH US
          </span>
        </div>

        {/* Заголовок */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#183E6B",
            marginBottom: 10,
            fontFamily: "'Sora', Arial, sans-serif",
            textAlign: "center",
            letterSpacing: "0.5px",
          }}
        >
          Create Account
        </div>

        {/* Поля */}
        <form style={{ width: "100%", maxWidth: 500 }} onSubmit={handleSubmit}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <img
              src="/images/user-icon.png"
              alt="user"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 22,
                height: 22,
                opacity: 0.7,
              }}
            />
            <input
              type="text"
              name="fullName"
              className="form-control"
              placeholder="Username"
              value={formData.fullName}
              required
              style={{
                fontSize: 16,
                minHeight: 44,
                borderRadius: 16,
                border: "1.5px solid #02457A",
                background: "transparent",
                color: "#183E6B",
                boxShadow: "none",
                paddingLeft: 48,
                fontWeight: 500,
              }}
              onChange={handleChange}
            />
          </div>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <img
              src="/images/password-icon.png"
              alt="password"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 22,
                height: 16,
                opacity: 0.7,
              }}
            />
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Password"
              value={formData.password}
              required
              style={{
                fontSize: 16,
                minHeight: 44,
                borderRadius: 16,
                border: "1.5px solid #02457A",
                background: "transparent",
                color: "#183E6B",
                boxShadow: "none",
                paddingLeft: 48,
                fontWeight: 500,
              }}
              onChange={handleChange}
            />
          </div>         

          <div style={{ position: "relative", marginBottom: 24 }}>
            <img
              src="/images/email-icon.png"
              alt="email"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 22,
                height: 16,
                opacity: 0.7,
              }}
            />
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email address"
              value={formData.email}
              required
              style={{
                fontSize: 16,
                minHeight: 44,
                borderRadius: 16,
                border: "1.5px solid #02457A",
                background: "transparent",
                color: "#183E6B",
                boxShadow: "none",
                paddingLeft: 48,
                fontWeight: 500,
              }}
              onChange={handleChange}
            />
          </div>

          {/* Кнопка реєстрації */}
          <button
            type="submit"
            className="btn w-100"
            style={{
              background: "#062C43",
              color: "#fff",
              fontWeight: 700,
              fontSize: 21,
              minHeight: 48,
              borderRadius: 12,
              marginBottom: 18,
              letterSpacing: "0.5px",
              marginTop: 6,
            }}
          >
            Create Account
          </button>
        </form>

        {/* Текст і лінк на логін */}
        <div className="w-100 text-center" style={{ marginTop: 12, color: "#8898b3", fontSize: 16 }}>
          Have an account?{" "}
          <Link to="/login" style={{ color: "#0C63E4", fontWeight: 600, marginLeft: 6 }}>
            Login
          </Link>
        </div>

        {/* Лінія з "or" */}
        <div style={{
          display: "flex", alignItems: "center",
          width: 500, maxWidth: "100%", margin: "24px 0"
        }}>
          <div style={{
            flex: 1, height: 1, background: "#888", opacity: 0.5,
          }}></div>
          <span style={{
            color: "#888", fontWeight: 500, fontSize: 16, margin: "0 12px"
          }}>or</span>
          <div style={{
            flex: 1, height: 1, background: "#888", opacity: 0.5,
          }}></div>
        </div>

        <div style={{
          display: "flex", gap: 16, width: 500, maxWidth: "100%",
          justifyContent: "center"
        }}>
          <button
            className="btn"
            style={{
              background: "transparent",
              color: "#001B48",
              fontWeight: 500,
              fontSize: 16,
              borderRadius: 16,
              minHeight: 44,
              border: "2px solid #02457A",
              width: "500px",
              boxShadow: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: "'Sora', Arial, sans-serif",
              transition: "box-shadow 0.2s",
            }}
            onClick={() => window.location.href = axiosInstance.defaults.baseURL + "google-auth/login"}
          >
            <img
              src="/images/Google.png"
              alt="google"
              style={{
                width: 30,
                height: 30,
                marginRight: 10,
                marginLeft: -6,
              }}
            />
            Sing up with Google
          </button>          
        </div>

        {error && (
          <div className="alert alert-danger mt-3" style={{ width: 500, maxWidth: "100%" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
