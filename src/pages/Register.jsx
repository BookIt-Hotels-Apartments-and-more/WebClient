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
  const [formErrors, setFormErrors] = useState({});
  
  const location = useLocation();
  const selectedRole = location.state?.role || localStorage.getItem("registerRole") || "Tenant";

  const validatePassword = (password, username = "") => {
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let errors = [];
    if (!/[A-Z]/.test(password)) errors.push("uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("number");
    if (!new RegExp(`[${specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(password))
      errors.push("special character");
    if (/(.)\1\1/.test(password)) errors.push("no more than 2 identical characters in a row");
    if (username && password.toLowerCase().includes(username.toLowerCase()))
      errors.push("not contain your username");
    return errors;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
    
    if (field === 'password' || (field === 'fullName' && formData.password)) {
      const password = field === 'password' ? value : formData.password;
      const username = field === 'fullName' ? value : formData.fullName;
      
      if (password) {
        const passwordErrors = validatePassword(password, username);
        if (passwordErrors.length > 0) {
          setFormErrors(prev => ({ 
            ...prev, 
            password: `Password must contain: ${passwordErrors.join(', ')}`
          }));
        } else {
          setFormErrors(prev => ({ ...prev, password: null }));
        }
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Username is required';
    } else if (formData.fullName.length < 3) {
      errors.fullName = 'Username must be at least 3 characters';
    } else if (formData.fullName.length > 50) {
      errors.fullName = 'Username must be less than 50 characters';
    } else if (!/^[ a-zA-Z0-9_.-]+$/.test(formData.fullName)) {
      errors.fullName = 'Username can contain letters, numbers, dots, hyphens, underscores and spaces';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 254) {
      errors.email = 'Email address is too long';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else {
      const passwordErrors = validatePassword(formData.password, formData.fullName);
      if (passwordErrors.length > 0) {
        errors.password = `Password must contain: ${passwordErrors.join(', ')}`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const payload = {
        username: formData.fullName,
        email: formData.email,
        password: formData.password,
      };
      
      try {
        const apiCall = selectedRole === "Landlord" ? registerLandlord : registerUser;
        await apiCall(payload);
        toast.success("You were registered successfully!", { autoClose: 4000 });
        localStorage.removeItem("registerRole");
        navigate("/login");
      } catch (error) {
        if (error.response) {
          if (error.response.status === 409) {
            toast.error('A user with this username or email already exists');
          } else if (error.response.data?.errors) {
            const backendErrors = error.response.data.errors;
            
            if (backendErrors.Username) {
              const usernameError = Array.isArray(backendErrors.Username) 
                ? backendErrors.Username.join(', ')
                : backendErrors.Username;
              toast.error(`Username: ${usernameError}`);
            }
            
            if (backendErrors.Email) {
              const emailError = Array.isArray(backendErrors.Email)
                ? backendErrors.Email.join(', ')
                : backendErrors.Email;
              toast.error(`Email: ${emailError}`);
            }
            
            if (backendErrors.Password) {
              const passwordError = Array.isArray(backendErrors.Password)
                ? backendErrors.Password.join(', ')
                : backendErrors.Password;
              toast.error(`Password: ${passwordError}`);
            }
          } else {
            toast.error('Registration failed. Please try again.');
          }
        } else {
          toast.error('Network error. Please check your connection and try again.');
        }
      }
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
                zIndex: 1,
              }}
            />
            <input
              type="text"
              name="fullName"
              className={`form-control ${
                formErrors.fullName ? 'is-invalid' : 
                formData.fullName.length >= 3 ? 'is-valid' : ''
              }`}
              placeholder="Username (3-50 characters)"
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
              maxLength={50}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
            {formErrors.fullName && (
              <div className="invalid-feedback d-block" style={{ fontSize: '0.875rem', marginTop: 4 }}>
                {formErrors.fullName}
              </div>
            )}
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
                zIndex: 1,
              }}
            />
            <input
              type="email"
              name="email"
              className={`form-control ${
                formErrors.email ? 'is-invalid' : 
                formData.email.includes('@') && formData.email.includes('.') ? 'is-valid' : ''
              }`}
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
              maxLength={254}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {formErrors.email && (
              <div className="invalid-feedback d-block" style={{ fontSize: '0.875rem', marginTop: 4 }}>
                {formErrors.email}
              </div>
            )}
          </div>

          <div style={{ position: "relative", marginBottom: 16, minHeight: 68 }}>
            <img
              src="/images/password-icon.png"
              alt="password"
              style={{
                position: "absolute",
                left: 14,
                top: 22,
                transform: "translateY(-50%)",
                width: 22,
                height: 16,
                opacity: 0.7,
                zIndex: 1,
              }}
            />
            <input
              type="password"
              name="password"
              className={`form-control ${
                formErrors.password ? 'is-invalid' : 
                formData.password && validatePassword(formData.password, formData.fullName).length === 0 ? 'is-valid' : ''
              }`}
              placeholder="Password (min 8 characters)"
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
              onChange={(e) => handleChange('password', e.target.value)}
            />

            {formErrors.password &&
              <div className="invalid-feedback d-block" style={{ fontSize: '0.875rem', marginTop: 5 }}>
                {formErrors.password}
              </div>}
          </div>

          <button
            type="submit"
            className="btn w-100"
            disabled={Object.keys(formErrors).some(key => formErrors[key])}
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
              opacity: Object.keys(formErrors).some(key => formErrors[key]) ? 0.6 : 1
            }}
          >
            Create Account
          </button>
        </form>

        <div className="w-100 text-center" style={{ marginTop: 12, color: "#8898b3", fontSize: 16 }}>
          Have an account?{" "}
          <Link to="/login" style={{ color: "#0C63E4", fontWeight: 600, marginLeft: 6 }}>
            Login
          </Link>
        </div>

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
      </div>
    </div>
  );
};

export default Register;