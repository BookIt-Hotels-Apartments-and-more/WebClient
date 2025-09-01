import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/authApi";
import { toast } from "react-toastify";

const PasswordReset = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const [password, setPassword] = useState(""); 
  const [formErrors, setFormErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

  const validatePassword = (password) => {
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let errors = [];
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("one number");
    if (!new RegExp(`[${specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(password))
      errors.push("one special character");
    if (/(.)\1\1/.test(password)) errors.push("no more than 2 identical characters in a row");
    return errors;
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: null }));
    }
    if (backendErrors.password) {
      setBackendErrors(prev => ({ ...prev, password: null }));
    }
    
    if (value) {
      const passwordErrors = validatePassword(value);
      if (passwordErrors.length > 0) {
        setFormErrors(prev => ({ 
          ...prev, 
          password: `Password must contain: ${passwordErrors.join(', ')}`
        }));
      } else {
        setFormErrors(prev => ({ ...prev, password: null }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        errors.password = `Password must contain: ${passwordErrors.join(', ')}`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1;
    
    if (!/(.)\1\1/.test(password)) score += 1;
    
    if (score <= 2) return { strength: 1, label: 'Weak', color: 'danger' };
    if (score <= 4) return { strength: 2, label: 'Fair', color: 'warning' };
    if (score <= 6) return { strength: 3, label: 'Good', color: 'info' };
    return { strength: 4, label: 'Strong', color: 'success' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendErrors({});
    
    if (validateForm()) {
      try {
        await resetPassword({token, newPassword: password});
        toast.success("Password was successfully changed. Please log in with your new password.");
        navigate("/login");
      } catch(error) {
        if (error?.response?.data?.errors?.NewPassword?.length) {
          setBackendErrors({
            password: error.response.data.errors.NewPassword.join(" and ")
          });
        } else {
          setBackendErrors({
            general: error?.response?.data?.message || "Failed to reset password. Please try again."
          });
        }
        toast.error("Failed to reset password. Please try again.");
      }
    }
  }

  return (
    <form style={{ width: "100%", maxWidth: 500, margin: "8rem auto 0" }} onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: 24, textAlign: "center", color: "#183E6B" }}>
        Create your new password
      </h2>

      {backendErrors.general && (
        <div className="alert alert-danger mb-3">
          {backendErrors.general}
        </div>
      )}

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
          className={`form-control ${
            formErrors.password || backendErrors.password ? 'is-invalid' : 
            password && validatePassword(password).length === 0 ? 'is-valid' : ''
          }`}
          placeholder="Password (min 8 characters)"
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
          onChange={(e) => handlePasswordChange(e.target.value)}
        />
      </div>         

        {/* Password strength indicator */}
        {password && (
          <div style={{ marginTop: 8 }}>
            <div className="d-flex align-items-center mb-1">
              <small className="text-muted me-2">Strength:</small>
              <span className={`badge bg-${passwordStrength.color} bg-opacity-10 text-${passwordStrength.color}`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="progress" style={{ height: '4px' }}>
              <div 
                className={`progress-bar bg-${passwordStrength.color}`}
                style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Password validation feedback */}
        {(formErrors.password || backendErrors.password) && (
          <div className="invalid-feedback d-block">
            {formErrors.password || backendErrors.password}
          </div>
        )}

        {/* Password requirements */}
        <div style={{ margin: 8, fontSize: '0.875rem', color: '#6c757d' }}>
          <small>Password must be at least 8 characters and include:</small>
          <div style={{ marginTop: 4 }}>
            {[
              { test: /[A-Z]/, label: 'One uppercase letter' },
              { test: /[a-z]/, label: 'One lowercase letter' },
              { test: /[0-9]/, label: 'One number' },
              { test: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, label: 'One special character' }
            ].map((req, index) => (
              <div key={index} className="d-flex align-items-center mb-1">
                <i className={`bi ${
                  password && req.test.test(password) 
                    ? 'bi-check-circle text-success' 
                    : 'bi-circle text-muted'
                } me-1`} style={{ fontSize: '0.8em' }}></i>
                <small className={
                  password && req.test.test(password) 
                    ? 'text-success' 
                    : 'text-muted'
                }>
                  {req.label}
                </small>
              </div>
            ))}
            <div className="d-flex align-items-center">
              <i className={`bi ${
                password && !/(.)\1\1/.test(password) 
                  ? 'bi-check-circle text-success' 
                  : 'bi-circle text-muted'
              } me-1`} style={{ fontSize: '0.8em' }}></i>
              <small className={
                password && !/(.)\1\1/.test(password) 
                  ? 'text-success' 
                  : 'text-muted'
              }>
                No more than 2 identical characters in a row
              </small>
            </div>
          </div>
        </div>

      <button
        type="submit"
        className="btn w-100 mt-2"
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
        Set New Password
      </button>
    </form>
  );
};

export default PasswordReset;