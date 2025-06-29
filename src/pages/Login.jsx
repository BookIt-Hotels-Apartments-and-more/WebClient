import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getCurrentUser, forgotPassword } from "../api/authApi";
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


  const handleClose = () => {
    navigate("/");
  };

  const handleEmailLogin = () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    loginUser({ email, password })
      .then((data) => {
        localStorage.setItem("token", data.token);
        axiosInstance.defaults.headers["Authorization"] = `Bearer ${data.token}`;
        return getCurrentUser();
      })
      .then((user) => {
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(setUser(user));
        if (loginSource === "partner") {
          sessionStorage.removeItem('loginSource');
          navigate("/landlordpanel");
        } else if (loginSource === "employee") {
          sessionStorage.removeItem('loginSource');
          navigate("/adminpanel");
        } else {
          navigate("/");
        }
      })
      .catch((err) => {
        alert(err.message || "Invalid email or password");
      });
  };

      // .then((user) => {
      //   console.log("👤 userData from login:", user);
      //   dispatch(setUser(user));
      //   navigate("/");
      //   // if (user.role === 1) {
      //   //   navigate("/landlordpanel");
      //   // } else if (user.role === 0) {
      //   //   navigate("/adminpanel");
      //   // } else {
      //   //   navigate("/");
      //   // }
      // })
      //     .catch((err) => {
      //       alert(err.message || "Invalid email or password");
      //     });
  


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
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Login</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="text-end mb-3">
              <button
                className="btn btn-link p-0"
                onClick={() => setShowForgot(true)}
              >
                Forgot your password?
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => {
                  window.location.href = "https://localhost:7065/google-auth/login";
                }}
              >
                Sign in with Google
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-dark w-100" onClick={handleEmailLogin}>
              Login
            </button>
          </div>
        </div>
      </div>

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
