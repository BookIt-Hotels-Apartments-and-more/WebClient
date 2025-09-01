import { useState } from 'react';

const CreateAdminModal = ({ show, onHide, onConfirm, loading = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const resetAdminForm = () => { setFormData({ username: '', email: '', password: '' }); };
  const [formErrors, setFormErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
    if (backendErrors[field]) {
      setBackendErrors(prev => ({ ...prev, [field]: null }));
    }
    
    if (field === 'password' || (field === 'username' && formData.password)) {
      const password = field === 'password' ? value : formData.password;
      const username = field === 'username' ? value : formData.username;
      
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
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 50) {
      errors.username = 'Username must be less than 50 characters';
    } else if (!/^[ a-zA-Z0-9_.-]+$/.test(formData.username)) {
      errors.username = 'Username can contain letters, numbers, dots, hyphens, underscores and spaces';
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
      const passwordErrors = validatePassword(formData.password, formData.username);
      if (passwordErrors.length > 0) {
        errors.password = `Password must contain: ${passwordErrors.join(', ')}`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendErrors({});
    
    if (validateForm()) {
      try {
        await onConfirm(formData, resetAdminForm);
        } catch (error) {
        if (error.response) {
          if (error.response.status === 409) {
            setBackendErrors({
              general: 'A user with this username or email already exists'
            });
          } else if (error.response.data?.errors) {
            const errors = {};
            const backendErrors = error.response.data.errors;
            
            if (backendErrors.Username) {
              errors.username = Array.isArray(backendErrors.Username) 
                ? backendErrors.Username.join(', ')
                : backendErrors.Username;
            }
            
            if (backendErrors.Email) {
              errors.email = Array.isArray(backendErrors.Email)
                ? backendErrors.Email.join(', ')
                : backendErrors.Email;
            }
            
            if (backendErrors.Password) {
              errors.password = Array.isArray(backendErrors.Password)
                ? backendErrors.Password.join(', ')
                : backendErrors.Password;
            }
            
            setBackendErrors(errors);
          } else {
            setBackendErrors({
              general: 'Failed to create administrator. Please try again.'
            });
          }
        } else {
          setBackendErrors({
            general: 'Network error. Please check your connection and try again.'
          });
        }
      }
    }
  };

  const handleClose = () => {
    setFormData({ username: '', email: '', password: '' });
    setFormErrors({});
    setBackendErrors({});
    onHide();
  };

  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, label: '', color: '' };
    
    const password = formData.password;
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

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={handleClose}></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-person-plus-fill me-2 text-primary"></i>
                Create New Administrator
              </h5>
              <button type="button" className="btn-close" onClick={handleClose} disabled={loading}></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {backendErrors.general && (
                  <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{backendErrors.general}</div>
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="adminUsername" className="form-label fw-semibold">
                    <i className="bi bi-person me-1"></i>Username *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      formErrors.username || backendErrors.username ? 'is-invalid' : 
                      formData.username.length >= 3 ? 'is-valid' : ''
                    }`}
                    id="adminUsername"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="Enter username (3-50 characters)"
                    disabled={loading}
                    autoFocus
                    maxLength={50}
                  />
                  {(formErrors.username || backendErrors.username) && (
                    <div className="invalid-feedback">
                      {formErrors.username || backendErrors.username}
                    </div>
                  )}
                  <div className="form-text">
                    Letters, numbers, dots, hyphens and underscores allowed
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="adminEmail" className="form-label fw-semibold">
                    <i className="bi bi-envelope me-1"></i>Email Address *
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      formErrors.email || backendErrors.email ? 'is-invalid' : 
                      formData.email.includes('@') && formData.email.includes('.') ? 'is-valid' : ''
                    }`}
                    id="adminEmail"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Enter email address"
                    disabled={loading}
                    maxLength={254}
                  />
                  {(formErrors.email || backendErrors.email) && (
                    <div className="invalid-feedback">
                      {formErrors.email || backendErrors.email}
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="adminPassword" className="form-label fw-semibold">
                    <i className="bi bi-lock me-1"></i>Password *
                  </label>
                  <div className="input-group">
                    <input
                      type="password"
                      className={`form-control ${
                        formErrors.password || backendErrors.password ? 'is-invalid' : 
                        formData.password && validatePassword(formData.password, formData.username).length === 0 ? 'is-valid' : ''
                      }`}
                      id="adminPassword"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Enter password (min 8 characters)"
                      disabled={loading}
                    />
                  </div>
                  
                  {formData.password && (
                    <div className="mt-2">
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
                  
                  {(formErrors.password || backendErrors.password) && (
                    <div className="invalid-feedback">
                      {formErrors.password || backendErrors.password}
                    </div>
                  )}
                  
                  <div className="form-text">
                    <small>Password must be at least 8 characters and include:</small>
                    <div className="mt-1">
                      {[
                        { test: /[A-Z]/, label: 'One uppercase letter' },
                        { test: /[a-z]/, label: 'One lowercase letter' },
                        { test: /[0-9]/, label: 'One number' },
                        { test: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, label: 'One special character' }
                      ].map((req, index) => (
                        <div key={index} className="d-flex align-items-center">
                          <i className={`bi ${
                            formData.password && req.test.test(formData.password) 
                              ? 'bi-check-circle text-success' 
                              : 'bi-circle text-muted'
                          } me-1`} style={{ fontSize: '0.8em' }}></i>
                          <small className={
                            formData.password && req.test.test(formData.password) 
                              ? 'text-success' 
                              : 'text-muted'
                          }>
                            {req.label}
                          </small>
                        </div>
                      ))}
                      <div className="d-flex align-items-center">
                        <i className={`bi ${
                          formData.password && !/(.)\1\1/.test(formData.password) 
                            ? 'bi-check-circle text-success' 
                            : 'bi-circle text-muted'
                        } me-1`} style={{ fontSize: '0.8em' }}></i>
                        <small className={
                          formData.password && !/(.)\1\1/.test(formData.password) 
                            ? 'text-success' 
                            : 'text-muted'
                        }>
                          No more than 2 identical characters in a row
                        </small>
                      </div>
                      {formData.username && (
                        <div className="d-flex align-items-center">
                          <i className={`bi ${
                            formData.password && !formData.password.toLowerCase().includes(formData.username.toLowerCase()) 
                              ? 'bi-check-circle text-success' 
                              : 'bi-circle text-muted'
                          } me-1`} style={{ fontSize: '0.8em' }}></i>
                          <small className={
                            formData.password && !formData.password.toLowerCase().includes(formData.username.toLowerCase()) 
                              ? 'text-success' 
                              : 'text-muted'
                          }>
                            Does not contain username
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary d-flex align-items-center"
                  disabled={loading || Object.keys(formErrors).some(key => formErrors[key])}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-1"></i>
                      Create Administrator
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateAdminModal;