import { useState, useEffect  } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, getCurrentUser, generateResetToken, resetPassword  } from "../api/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { axiosInstance } from "../api/axios";
import { useLocation } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [loadingReset, setLoadingReset] = useState(false);
  const [message, setMessage] = useState("");  

  const loginSource = location.state?.source || sessionStorage.getItem('loginSource') || null;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (location.pathname === "/auth/reset-token" && token) {
      setShowReset(true);
      setResetForm(prev => ({ ...prev, token }));
    }
  }, [location]);

  const handleEmailLogin = async () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      axiosInstance.defaults.headers["Authorization"] = `Bearer ${data.token}`;

      const fullUser = await getCurrentUser();

      localStorage.setItem("user", JSON.stringify(fullUser));
      dispatch(setUser(fullUser));

      const whoAreYou = localStorage.getItem("whoareyou");

      if (loginSource === "partner") {
        sessionStorage.removeItem('loginSource');
        navigate("/accounthome");
      } else if (loginSource === "employee") {
        sessionStorage.removeItem('loginSource');
        navigate("/adminpanel");
      } else if (whoAreYou === "landlord") {
        navigate("/accounthome");
      } else if (whoAreYou === "user" || whoAreYou === "traveler") {
        navigate("/accounthome");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert(err.message || "Invalid email or password");
    }
  };

  const handleGenerateToken = async () => {
    if (!recoveryEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    setLoadingReset(true);
    setMessage("");
    try {
      const res = await generateResetToken(recoveryEmail);
      if (res?.token) setResetToken(res.token);
      setMessage(res?.message || `If this email exists, we sent a reset link/token to ${recoveryEmail}.`);
      setForgotStep(2);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Error while generating reset token.");
    } finally {
      setLoadingReset(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPwd || newPwd.length < 6) {
      alert("Enter token and a new password (min 6 chars).");
      return;
    }
    setLoadingReset(true);
    setMessage("");
    try {
      const res = await resetPassword({ token: resetToken, newPassword: newPwd });
      setMessage(res?.message || "Password was successfully changed. Please login with the new password.");
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setRecoveryEmail("");
        setResetToken("");
        setNewPwd("");
        setMessage("");
      }, 1200);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to reset password. Check token and try again.");
    } finally {
      setLoadingReset(false);
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
        {/* Title */}
        <div style={{ width: "100%", maxWidth: 1150, textAlign: "center", marginBottom: 18 }}>
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

        {/* Email */}
        <div style={{ position: "relative", width: "100%", maxWidth: 500, marginBottom: 10 }}>
          <img
            src="/images/email-icon.png"
            alt="email"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 24, height: 17 }}
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

        {/* Password */}
        <div style={{ position: "relative", width: "100%", maxWidth: 500, marginBottom: 10 }}>
          <img
            src="/images/password-icon.png"
            alt="password"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 24, height: 17 }}
          />
          <input
            type="password"
            className="form-control"
            placeholder="Password"
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
            onClick={() => {
              setShowForgot(true);
              setForgotStep(1);
              setMessage("");
            }}
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

        {/* ... Google button + register link залишив без змін ... */}
        <div style={{ display: "flex", alignItems: "center", width: 500, maxWidth: "100%", margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#888", opacity: 0.5 }}></div>
          <span style={{ color: "#888", fontWeight: 500, fontSize: 16, margin: "0 12px" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#888", opacity: 0.5 }}></div>
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
          onClick={() => (window.location.href = axiosInstance.defaults.baseURL + "google-auth/login")}
        >
          <img src="/images/Google.png" alt="google" style={{ width: 30, height: 30, marginRight: 10, marginLeft: -6 }} />
          Sign in with Google
        </button>

        <div className="w-100 text-center" style={{ marginTop: 20, color: "#8898b3", fontSize: 16 }}>
          Don’t have an account?
          <Link to="/whoareyou" style={{ color: "#0C63E4", fontWeight: 600, marginLeft: 6 }}>
            Create Account
          </Link>
        </div>
      </div>

      {/* Forgot/Reset Modal */}
      {showForgot && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {forgotStep === 1 ? "Password Recovery" : "Set a New Password"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotStep(1);
                    setRecoveryEmail("");
                    setResetToken("");
                    setNewPwd("");
                    setMessage("");
                  }}
                />
              </div>

              <div className="modal-body">
                {forgotStep === 1 ? (
                  <>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <label className="form-label">Token</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Paste token from email"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                    />
                    <label className="form-label">New password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="New password"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                    />
                    <div className="form-text">Min length: 6 characters</div>
                  </>
                )}

                {message && <div className="alert alert-info mt-3">{message}</div>}
              </div>

              <div className="modal-footer">
                {forgotStep === 1 ? (
                  <button className="btn btn-primary w-100" disabled={loadingReset} onClick={handleGenerateToken}>
                    {loadingReset ? "Sending..." : "Send reset email"}
                  </button>
                ) : (
                  <button className="btn btn-success w-100" disabled={loadingReset} onClick={handleResetPassword}>
                    {loadingReset ? "Saving..." : "Set new password"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;