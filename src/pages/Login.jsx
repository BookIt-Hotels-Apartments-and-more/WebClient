import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, getCurrentUser, forgotPassword } from "../api/authApi";
import { getUserById } from "../api/userApi";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { axiosInstance } from "../api/axios";
import { useLocation } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const loginSource = location.state?.source || sessionStorage.getItem('loginSource') || null;

  const handleEmailLogin = async () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      axiosInstance.defaults.headers["Authorization"] = `Bearer ${data.token}`;

      const user = await getCurrentUser();

      const fullUser = await getUserById(user.id);

      localStorage.setItem("user", JSON.stringify(fullUser));
      dispatch(setUser(fullUser));

      const whoAreYou = localStorage.getItem("whoareyou");

      if (loginSource === "partner") {
        sessionStorage.removeItem('loginSource');
        navigate("/landlordpanel");
      } else if (loginSource === "employee") {
        sessionStorage.removeItem('loginSource');
        navigate("/adminpanel");
      } else if (whoAreYou === "landlord") {
        navigate("/landlordpanel");
      } else if (whoAreYou === "user" || whoAreYou === "traveler") {
        navigate("/userpanel");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert(err.message || "Invalid email or password");
    }
  };


  const handleForgotPassword = async () => {
    if (!recoveryEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    try {
      const res = await forgotPassword(recoveryEmail);
      setMessage(res.message || `A password recovery email has been sent to ${recoveryEmail}`);
    } catch (err) {
      setMessage("An error occurred during password recovery.");
      console.error("❌ Forgot password error:", err);
    } finally {
      setRecoveryEmail("");
      setShowForgot(false);
    }
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
          minWidth: 480,
          width: 1100,
          height: 650,
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
       {/* Outline-текст ЗВЕРХУ */}
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

        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#183E6B",
            marginBottom: 10,
            fontFamily: "'Sora', Arial, sans-serif",
            textAlign: "center",
            letterSpacing: "0.5px",
          }}
        >
          Login to Your Account
        </div>

        <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 500,
            marginBottom: 10
          }}>
            <img
              src="/images/email-icon.png"
              alt="email"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 24,
                height: 17
              }}
            />
            <input
              type="email"
              className="form-control"
              placeholder="Email address"
              value={email}
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
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 500,
            marginBottom: 10
          }}>
            <img
              src="/images/password-icon.png"
              alt="password"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 24,
                height: 17
              }}
            />
            <input
              type="password"
              className="form-control"
              placeholder="password"
              value={password}
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
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

        <div className="text-end w-50" style={{ marginBottom: 8 }}>
          <button
            className="btn btn-link p-0"
            style={{ color: "#183E6B", fontWeight: 500, fontSize: 14, textDecoration: "underline" }}
            onClick={() => setShowForgot(true)}
          >
            Forgot your password?
          </button>
        </div>

        <button
          className="btn w-50"
          style={{
            background: "#062C43",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            minHeight: 40,
            borderRadius: 12,
            marginBottom: 18,
            letterSpacing: "0.5px",
            marginTop: 6,
          }}
          onClick={handleEmailLogin}
        >
          Login
        </button>

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
          onClick={() => window.location.href = "https://localhost:7065/google-auth/login"}
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
          Sign in with Google
        </button>


        <div className="w-100 text-center" style={{ marginTop: 20, color: "#8898b3", fontSize: 16 }}>
          Don’t have an account?
          <Link to="/register" style={{ color: "#0C63E4", fontWeight: 600, marginLeft: 6 }}>
            Create Account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Password Recovery</h5>
                <button type="button" className="btn-close" onClick={() => setShowForgot(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary w-100" onClick={handleForgotPassword}>
                  Send
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
