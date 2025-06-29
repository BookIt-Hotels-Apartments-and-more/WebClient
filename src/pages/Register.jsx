import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { useLocation } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const location = useLocation();
  const selectedRole = location.state?.role || "Tenant";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    registerUser({
      username: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: selectedRole,
    })
      .then((data) => {
        console.log("Registered:", data);
        alert("You have successfully registered in our service!");
        navigate("/login");
      })
      .catch((err) => {
        alert(err.message || "Registration error");
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
            <h5 className="modal-title">Register</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <input
                type="text"
                name="fullName"
                className="form-control mb-3"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              {/* <input
                type="tel"
                name="phone"
                className="form-control mb-3"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
              /> */}

              <input
                type="email"
                name="email"
                className="form-control mb-3"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                className="form-control mb-3"
                placeholder="Password"
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
                  Sign in with Google
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-dark w-100">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
