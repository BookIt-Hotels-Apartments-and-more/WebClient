import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/authApi";
import { toast } from "react-toastify";

const PasswordReset = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const [error, setError] = useState(""); 
  const [password, setPassword] = useState(""); 

  const  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({token, newPassword: password});
      toast.success("Password was successfully changed. Please log in with your new password.");
      navigate("/login");
    } catch(error) {
      if (error?.response?.data?.errors?.NewPassword?.length) {
        setError(error.response.data.errors.NewPassword.join(" and "));
      }
      else {
        setError(error?.response?.data?.message || "Failed to reset password. Please try again.");
      }
      toast.error("Failed to reset password. Please try again.");
    }
  }

  return (
        <form style={{ width: "100%", maxWidth: 500, margin: "8rem auto 0" }} onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: 24, textAlign: "center", color: "#183E6B" }}>
            Create your new password
          </h2>
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
              value={password}
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
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>         

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
            Set New Password
          </button>
          {error && (
            <div className="alert alert-danger mt-3" style={{ width: 500, maxWidth: "100%" }}>
                {error}
            </div>
        )}
        </form>
  );
};

export default PasswordReset;
