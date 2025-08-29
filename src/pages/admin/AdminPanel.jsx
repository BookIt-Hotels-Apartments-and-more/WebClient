import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllUsers } from "../../api/userApi";
import { getAllEstablishments } from "../../api/establishmentsApi";
import { fetchApartments } from "../../api/apartmentApi";
import { getAllBookings, deleteBooking } from "../../api/bookingApi";
import { getAllPayments } from "../../api/paymentApi";
import { getAllReviews } from "../../api/reviewApi";
import { PAYMENT_STATUS } from "../../utils/enums";
import { setUser } from "../../store/slices/userSlice";
import { displayableRole } from "../../utils/roles";
import { displayableVibe, displayableEstablishmentType } from "../../utils/enums";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { axiosInstance } from "../../api/axios";

const badgeByStatus = (status) => {
  switch (status) {
    case PAYMENT_STATUS.Completed: return <span className="badge bg-success">paid</span>;
    case PAYMENT_STATUS.Pending:   return <span className="badge bg-warning text-dark">pending</span>;
    case PAYMENT_STATUS.Failed:    return <span className="badge bg-danger">failed</span>;
    case PAYMENT_STATUS.Cancelled: return <span className="badge bg-secondary">cancelled</span>;
    default:                       return <span className="badge bg-light text-dark">—</span>;
  }
};

const paymentTypeLabel = (t) => t===0 ? "Cash" : t===1 ? "Mono" : t===2 ? "BankTransfer" : "—";

const restrictUser = async (userId) => {
  const response = await axiosInstance.patch(`/api/user/${userId}/restrict`);
  return response.data;
};

const unrestrictUser = async (userId) => {
  const response = await axiosInstance.patch(`/api/user/${userId}/unrestrict`);
  return response.data;
};

const promoteUserToAdmin = async (userId) => {
  const response = await axiosInstance.patch(`/api/user/${userId}/role/0`);
  return response.data;
};

const unpromoteAdminToUser = async (userId) => {
  const response = await axiosInstance.patch(`/api/user/${userId}/role/2`);
  return response.data;
};

const createAdmin = async (userData) => {
  const response = await axiosInstance.post('/auth/register-admin', userData);
  return response.data;
};

const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "spinner-border-sm",
    md: "",
    lg: "spinner-border-lg"
  };

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="ms-3 text-muted">Loading data...</span>
    </div>
  );
};

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

const SearchAndFilter = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  onClearFilters,
  filterOptions = {},
  loading = false 
}) => {
  return (
    <div className="card bg-light border-0 mb-3">
      <div className="card-body py-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-semibold mb-1">
              <i className="bi bi-search me-1"></i>Search
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by name, email, address..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={loading}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => onSearchChange('')}
                  disabled={loading}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className="col-md-2">
              <label className="form-label fw-semibold mb-1">
                <i className={`bi ${options.icon || 'bi-filter'} me-1`}></i>
                {options.label}
              </label>
              <select
                className="form-select"
                value={filters[key] || ''}
                onChange={(e) => onFilterChange(key, e.target.value)}
                disabled={loading}
              >
                <option value="">All {options.label}</option>
                {options.values.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
              onClick={onClearFilters}
              disabled={loading || (!searchTerm && Object.keys(filters).length === 0)}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Clear
            </button>
          </div>
        </div>

        {(searchTerm || Object.keys(filters).length > 0) && (
          <div className="mt-3 pt-2 border-top">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="text-muted fw-semibold">Active filters:</span>
              {searchTerm && (
                <span className="badge bg-primary bg-opacity-10 text-primary">
                  Search: "{searchTerm}"
                  <button 
                    className="btn-close btn-close-sm ms-2" 
                    onClick={() => onSearchChange('')}
                    style={{ fontSize: '0.6em' }}
                  ></button>
                </span>
              )}
              {Object.entries(filters).map(([key, value]) => (
                value && (
                  <span key={key} className="badge bg-info bg-opacity-10 text-info">
                    {filterOptions[key]?.label}: {
                      filterOptions[key]?.values.find(v => v.value === value)?.label || value
                    }
                    <button 
                      className="btn-close btn-close-sm ms-2" 
                      onClick={() => onFilterChange(key, '')}
                      style={{ fontSize: '0.6em' }}
                    ></button>
                  </span>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultsSummary = ({ total, filtered, searchTerm, hasFilters }) => {
  if (total === filtered && !searchTerm && !hasFilters) {
    return (
      <div className="text-muted mb-3">
        <i className="bi bi-info-circle me-1"></i>
        Showing all {total} records
      </div>
    );
  }

  return (
    <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
      <i className="bi bi-funnel me-2"></i>
      <div>
        Showing <strong>{filtered}</strong> of <strong>{total}</strong> records
        {(searchTerm || hasFilters) && (
          <span className="text-muted"> (filtered)</span>
        )}
      </div>
    </div>
  );
};

const ConfirmationModal = ({ show, onHide, onConfirm, title, message, confirmText = "Confirm", confirmVariant = "danger" }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onHide}></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Cancel
              </button>
              <button type="button" className={`btn btn-${confirmVariant}`} onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const SortControls = ({ label, sortDesc, setSortDesc, loading = false }) => (
  <div className="d-flex align-items-center gap-2 mb-3">
    <label className="form-label mb-0 me-2 fw-semibold">{label}</label>
    <div className="btn-group" role="group">
      <button
        className={`btn btn-sm ${sortDesc ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => setSortDesc(true)}
        disabled={loading}
      >
        <i className="bi bi-sort-down me-1"></i>
        Descending
      </button>
      <button
        className={`btn btn-sm ${!sortDesc ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => setSortDesc(false)}
        disabled={loading}
      >
        <i className="bi bi-sort-up me-1"></i>
        Ascending
      </button>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children, count = null, filteredCount = null, loading = false }) => (
  <li className="nav-item">
    <button 
      className={`nav-link ${active ? "active" : ""} position-relative`} 
      onClick={onClick}
      disabled={loading}
      style={{ 
        borderRadius: "8px 8px 0 0",
        fontWeight: active ? 600 : 500,
        transition: "all 0.2s ease"
      }}
    >
      {children}
      {count !== null && (
        <span className={`badge ${active ? 'bg-light text-primary' : 'bg-primary'} ms-2 rounded-pill`}>
          {filteredCount !== null && filteredCount !== count ? `${filteredCount}/${count}` : count}
        </span>
      )}
    </button>
  </li>
);

const DataCard = ({ title, children, onRefresh, loading = false, error = null, headerActions = null }) => (
  <div className="card border-0 shadow-sm">
    <div className="card-header bg-white border-0 py-3">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0 text-primary fw-bold">{title}</h5>
        <div className="d-flex gap-2">
          {headerActions}
          <button 
            className="btn btn-outline-primary btn-sm d-flex align-items-center" 
            onClick={onRefresh}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
    <div className="card-body">
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{error}</div>
        </div>
      )}
      {children}
    </div>
  </div>
);

export default function AdminPanel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [active, setActive] = useState("users");
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilters, setUserFilters] = useState({});
  const [hotelFilters, setHotelFilters] = useState({});
  const [apartmentFilters, setApartmentFilters] = useState({});
  const [bookingFilters, setBookingFilters] = useState({});
  const [paymentFilters, setPaymentFilters] = useState({});
  const [reviewFilters, setReviewFilters] = useState({});
  
  const [sortDesc, setSortDesc] = useState(true);
  const [userSortDesc, setUserSortDesc] = useState(true);
  const [hotelSortDesc, setHotelSortDesc] = useState(true);
  const [aptSortDesc, setAptSortDesc] = useState(true);
  const [bookingSortDesc, setBookingSortDesc] = useState(true);
  const [reviewSortDesc, setReviewSortDesc] = useState(true);

  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [apartments, setApts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [createAdminLoading, setCreateAdminLoading] = useState(false);

  const userFilterOptions = useMemo(() => ({
    role: {
      label: 'Role',
      icon: 'bi-shield',
      values: [
        { value: 'Customer', label: 'Customer' },
        { value: 'Landlord', label: 'Landlord' },
        { value: 'Administrator', label: 'Administrator' }
      ]
    },
    status: {
      label: 'Status',
      icon: 'bi-person-check',
      values: [
        { value: 'active', label: 'Active' },
        { value: 'restricted', label: 'Restricted' }
      ]
    },
    emailConfirmed: {
      label: 'Email Status',
      icon: 'bi-envelope-check',
      values: [
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'unconfirmed', label: 'Unconfirmed' }
      ]
    }
  }), []);

  const hotelFilterOptions = useMemo(() => {
    const ratings = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return {
      rating: {
        label: 'Min Rating',
        icon: 'bi-star',
        values: ratings.map(r => ({ value: r, label: `${r}+ Stars` }))
      }
    };
  }, []);

  const apartmentFilterOptions = useMemo(() => {
    const priceRanges = [
      { value: '0-50', label: '€0 - €50' },
      { value: '51-100', label: '€51 - €100' },
      { value: '101-200', label: '€101 - €200' },
      { value: '201-500', label: '€201 - €500' },
      { value: '500+', label: '€500+' }
    ];

    const ratings = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    return {
      priceRange: {
        label: 'Price Range',
        icon: 'bi-currency-euro',
        values: priceRanges
      },
      rating: {
        label: 'Min Rating',
        icon: 'bi-star',
        values: ratings.map(r => ({ value: r, label: `${r}+ Stars` }))
      }
    };
  }, []);

  const bookingFilterOptions = useMemo(() => ({
    checkedIn: {
      label: 'Check-in Status',
      icon: 'bi-check-circle',
      values: [
        { value: 'true', label: 'Checked In' },
        { value: 'false', label: 'Not Checked In' }
      ]
    },
    dateRange: {
      label: 'Date Range',
      icon: 'bi-calendar',
      values: [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'past', label: 'Past' }
      ]
    }
  }), []);

  const paymentFilterOptions = useMemo(() => ({
    status: {
      label: 'Status',
      icon: 'bi-check-circle',
      values: [
        { value: PAYMENT_STATUS.Completed, label: 'Completed' },
        { value: PAYMENT_STATUS.Pending, label: 'Pending' },
        { value: PAYMENT_STATUS.Failed, label: 'Failed' },
        { value: PAYMENT_STATUS.Cancelled, label: 'Cancelled' }
      ]
    },
    type: {
      label: 'Payment Type',
      icon: 'bi-credit-card',
      values: [
        { value: '0', label: 'Cash' },
        { value: '1', label: 'Mono' },
        { value: '2', label: 'Bank Transfer' }
      ]
    }
  }), []);

  const reviewFilterOptions = useMemo(() => ({
    rating: {
      label: 'Min Rating',
      icon: 'bi-star',
      values: ['1', '2', '3', '4', '5', '6', '7', '8', '9']
        .map(r => ({ value: r, label: `${r}+ Stars` }))
    }
  }), []);

  const handleFilterChange = (filterSetter) => (key, value) => {
    filterSetter(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleClearFilters = (filterSetter) => () => {
    setSearchTerm('');
    filterSetter({});
  };

  const filterUsers = useCallback((users, search, filters) => {
    return users.filter(user => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.role && displayableRole(user.role) !== filters.role) {
        return false;
      }

      if (filters.status) {
        if (filters.status === 'active' && user.isRestricted) return false;
        if (filters.status === 'restricted' && !user.isRestricted) return false;
      }

      if (filters.emailConfirmed) {
        if (filters.emailConfirmed === 'confirmed' && !user.emailConfirmed) return false;
        if (filters.emailConfirmed === 'unconfirmed' && user.emailConfirmed) return false;
      }

      return true;
    });
  }, []);

  const filterHotels = useCallback((hotels, search, filters) => {
    return hotels.filter(hotel => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          hotel.name?.toLowerCase().includes(searchLower) ||
          hotel.geolocation?.address?.toLowerCase().includes(searchLower) ||
          hotel.owner?.username?.toLowerCase().includes(searchLower) ||
          displayableVibe(hotel.vibe).toLowerCase().includes(searchLower);
          displayableEstablishmentType(hotel.type).toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.rating) {
        const minRating = parseInt(filters.rating);
        const hotelRating = hotel.rating?.generalRating || 0;
        if (hotelRating < minRating) return false;
      }

      return true;
    });
  }, []);

  const filterApartments = useCallback((apartments, search, filters) => {
    return apartments.filter(apt => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          apt.name?.toLowerCase().includes(searchLower) ||
          apt.establishment?.name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.priceRange && apt.price != null) {
        const price = Number(apt.price);
        const range = filters.priceRange;
        
        if (range === '0-50' && (price < 0 || price > 50)) return false;
        if (range === '51-100' && (price < 51 || price > 100)) return false;
        if (range === '101-200' && (price < 101 || price > 200)) return false;
        if (range === '201-500' && (price < 201 || price > 500)) return false;
        if (range === '500+' && price < 500) return false;
      }

      if (filters.rating) {
        const minRating = parseInt(filters.rating);
        const hotelRating = apt.rating?.generalRating || 0;
        if (hotelRating < minRating) return false;
      }

      return true;
    });
  }, []);

  const filterBookings = useCallback((bookings, search, filters) => {
    return bookings.filter(booking => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          booking.customer?.username?.toLowerCase().includes(searchLower) ||
          booking.apartment?.name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.checkedIn !== undefined) {
        const isCheckedIn = filters.checkedIn === 'true';
        if (booking.isCheckedIn !== isCheckedIn) return false;
      }

      if (filters.dateRange) {
        const now = new Date();
        const bookingDate = new Date(booking.dateFrom);
        const checkoutDate = new Date(booking.dateTo);
        
        switch (filters.dateRange) {
          case 'today':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (!(bookingDate >= today && bookingDate < tomorrow)) return false;
            break;
          case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            if (!(bookingDate >= weekStart && bookingDate < weekEnd)) return false;
            break;
          case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            if (!(bookingDate >= monthStart && bookingDate < monthEnd)) return false;
            break;
          case 'upcoming':
            if (bookingDate <= now) return false;
            break;
          case 'past':
            if (checkoutDate > now) return false;
            break;
        }
      }

      return true;
    });
  }, []);

  const filterPayments = useCallback((payments, search, filters, bookingById) => {
    return payments.filter(payment => {
      const booking = bookingById.get(payment.bookingId);
      
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          booking?.customer?.username?.toLowerCase().includes(searchLower) ||
          booking?.apartment?.name?.toLowerCase().includes(searchLower) ||
          paymentTypeLabel(payment.type).toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.status && payment.status !== parseInt(filters.status)) {
        return false;
      }

      if (filters.type && payment.type !== parseInt(filters.type)) {
        return false;
      }

      return true;
    });
  }, []);

  const filterReviews = useCallback((reviews, search, filters) => {
    return reviews.filter(review => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          review.booking?.customer?.username?.toLowerCase().includes(searchLower) ||
          review.author?.username?.toLowerCase().includes(searchLower) ||
          review.booking?.apartment?.name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.rating && review.rating != null) {
        const minRating = parseInt(filters.rating);
        if (review.rating < minRating) return false;
      }

      return true;
    });
  }, []);
  
  const loadAll = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const [u, e, a, b, p, r] = await Promise.all([
        getAllUsers().catch((err) => { console.error("users:", err); return []; }),
        getAllEstablishments().catch((err) => { console.error("est:", err); return []; }),
        fetchApartments().catch((err) => { console.error("apts:", err); return []; }),
        getAllBookings().catch((err) => { console.error("bookings:", err); return []; }),
        getAllPayments().catch(err => { console.error("payments:", err); return []; }),
        getAllReviews().catch((err) => { console.error("reviews:", err); return []; }),
      ]);

      setUsers(toArr(u));
      setHotels(toArr(e));
      setApts(toArr(a));
      setBookings(toArr(b));
      setPayments(toArr(p));
      setReviews(toArr(r));
      
      if (showLoader) {
        toast.success("Data refreshed successfully");
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data. Please try again.");
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadAll(false); 
  }, [loadAll]);

  const handleUserAction = async (action, userId, actionName) => {
    setActionLoading(userId);
    try {
      await action(userId);
      toast.success(`User ${actionName} successfully`);
      loadAll(false);
    } catch (err) {
      toast.error(`Failed to ${actionName} user`);
      console.error(`${actionName} error:`, err);
    } finally {
      setActionLoading(null);
    }
  };

const handleCreateAdmin = async (adminData, resetAdminForm) => {
  setCreateAdminLoading(true);
  try {
    await createAdmin(adminData);
    toast.success("Administrator created successfully");
    setShowCreateAdminModal(false);
    loadAll(false);
    resetAdminForm();
  } catch {
    toast.error("Failed to create administrator");
  } finally {
    setCreateAdminLoading(false);
  }
};

  const handleDeleteBooking = (booking) => {
    setDeleteTarget(booking);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await deleteBooking(deleteTarget.id);
        toast.success("Booking deleted successfully");
        loadAll(false);
      } catch (err) {
        toast.error("Failed to delete booking");
        console.error("Delete error:", err);
      }
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const getUserAdditionalData = (user) => {
    const role = displayableRole(user.role);
    
    switch (role) {
      case 'Admin':
        return user.createdAt ? "Registered on " + new Date(user.createdAt).toLocaleDateString() : '—';
      case 'Landlord':
        return `${user.ownedEstablishments.length} establishment${user.ownedEstablishments.length !== 1 ? 's' : ''}`;
      case 'Traveller':
        return `${user?.bookings?.length} booking${user?.bookings?.length !== 1 ? 's' : ''}`;
      default:
        return '—';
    }
  };

  const filteredUsers = useMemo(() => {
    const filtered = filterUsers(users, searchTerm, userFilters);
    return filtered.sort((a, b) => (userSortDesc ? b.id - a.id : a.id - b.id));
  }, [users, searchTerm, userFilters, userSortDesc, filterUsers]);

  const filteredHotels = useMemo(() => {
    const filtered = filterHotels(hotels, searchTerm, hotelFilters);
    return filtered.sort((a, b) => (hotelSortDesc ? b.id - a.id : a.id - b.id));
  }, [hotels, searchTerm, hotelFilters, hotelSortDesc, filterHotels]);

  const filteredApartments = useMemo(() => {
    const filtered = filterApartments(apartments, searchTerm, apartmentFilters);
    return filtered.sort((a, b) => (aptSortDesc ? b.id - a.id : a.id - b.id));
  }, [apartments, searchTerm, apartmentFilters, aptSortDesc, filterApartments]);

  const filteredBookings = useMemo(() => {
    const filtered = filterBookings(bookings, searchTerm, bookingFilters);
    return filtered.sort((a, b) => (bookingSortDesc ? b.id - a.id : a.id - b.id));
  }, [bookings, searchTerm, bookingFilters, bookingSortDesc, filterBookings]);

  const bookingById = useMemo(() => {
    const m = new Map();
    bookings.forEach(b => m.set(b.id, b));
    return m;
  }, [bookings]);

  const filteredPayments = useMemo(() => {
    const filtered = filterPayments(payments, searchTerm, paymentFilters, bookingById);
    return filtered.sort((a, b) => sortDesc ? (b.id - a.id) : (a.id - b.id));
  }, [payments, searchTerm, paymentFilters, sortDesc, filterPayments, bookingById]);

  const filteredReviews = useMemo(() => {
    const filtered = filterReviews(reviews, searchTerm, reviewFilters);
    return filtered.sort((a, b) => (reviewSortDesc ? b.id - a.id : a.id - b.id));
  }, [reviews, searchTerm, reviewFilters, reviewSortDesc, filterReviews]);

  const fmtDate = (iso) => iso?.split("T")[0] ?? "—";
  const fmt1 = (v) => (v != null && !Number.isNaN(Number(v)) ? Number(v).toFixed(1) : "—");

  const handleLogout = () => {
    dispatch(setUser(null));
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (axiosInstance?.defaults?.headers?.Authorization) {
      delete axiosInstance.defaults.headers.Authorization;
    }
    toast.success("You have been logged out", { autoClose: 2000 });
    navigate("/");
  };

  const toArr = (x) => Array.isArray(x) ? x : (x?.items ?? x ?? []);

  if (initialLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(255,255,255,0.97) 0%,
              rgba(255,255,255,0.14) 40%,
              rgba(255,255,255,0) 80%
            ),
            url('/images/signin.png')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "60px 0 40px 0",
          marginTop: "-110px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 16,
            padding: "60px",
            boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
          }}
        >
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(255,255,255,0.97) 0%,
            rgba(255,255,255,0.14) 40%,
            rgba(255,255,255,0) 80%
          ),
          url('/images/signin.png')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "60px 0 40px 0",
        marginTop: "-110px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          padding: "32px 36px",
          width: "100%",
          maxWidth: "1800px",
          margin: "0 auto",
          marginTop: 100,
          boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
        }}
      >
        <div className="container-fluid py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1 text-primary fw-bold">
                <i className="bi bi-gear-fill me-2"></i>
                Admin Panel
              </h2>
              <p className="text-muted mb-0">Manage your application data and settings</p>
            </div>
            <button
              className="btn btn-danger d-flex align-items-center"
              style={{ borderRadius: 12, fontWeight: 600, minWidth: 140 }}
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Log Out
            </button>
          </div>

          <ul className="nav nav-tabs mb-4" style={{ borderBottom: "2px solid #dee2e6" }}>
            <TabButton 
              active={active === "users"} 
              onClick={() => setActive("users")} 
              count={users.length} 
              filteredCount={filteredUsers.length}
              loading={loading}
            >
              <i className="bi bi-people-fill me-2"></i>Users
            </TabButton>
            <TabButton 
              active={active === "hotels"} 
              onClick={() => setActive("hotels")} 
              count={hotels.length} 
              filteredCount={filteredHotels.length}
              loading={loading}
            >
              <i className="bi bi-building me-2"></i>Establishments
            </TabButton>
            <TabButton 
              active={active === "apartments"} 
              onClick={() => setActive("apartments")} 
              count={apartments.length} 
              filteredCount={filteredApartments.length}
              loading={loading}
            >
              <i className="bi bi-house-door-fill me-2"></i>Apartments
            </TabButton>
            <TabButton 
              active={active === "bookings"} 
              onClick={() => setActive("bookings")} 
              count={bookings.length} 
              filteredCount={filteredBookings.length}
              loading={loading}
            >
              <i className="bi bi-calendar-check me-2"></i>Bookings
            </TabButton>
            <TabButton 
              active={active === "payments"} 
              onClick={() => setActive("payments")} 
              count={payments.length} 
              filteredCount={filteredPayments.length}
              loading={loading}
            >
              <i className="bi bi-credit-card-fill me-2"></i>Payments
            </TabButton>
            <TabButton 
              active={active === "reviews"} 
              onClick={() => setActive("reviews")} 
              count={reviews.length} 
              filteredCount={filteredReviews.length}
              loading={loading}
            >
              <i className="bi bi-star-fill me-2"></i>Reviews
            </TabButton>
          </ul>

          {active === "users" && (
            <DataCard 
              title="User Management" 
              onRefresh={() => loadAll(true)} 
              loading={loading}
              error={error}
              headerActions={
                <button
                  className="btn btn-success btn-sm d-flex align-items-center"
                  onClick={() => setShowCreateAdminModal(true)}
                  disabled={loading}
                >
                  <i className="bi bi-person-plus me-1"></i>
                  New Admin
                </button>
              }
            >
              <SearchAndFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={userFilters}
                onFilterChange={handleFilterChange(setUserFilters)}
                onClearFilters={handleClearFilters(setUserFilters)}
                filterOptions={userFilterOptions}
                loading={loading}
              />

              <ResultsSummary
                total={users.length}
                filtered={filteredUsers.length}
                searchTerm={searchTerm}
                hasFilters={Object.keys(userFilters).length > 0}
              />

              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <SortControls 
                    label="Sort by ID" 
                    sortDesc={userSortDesc} 
                    setSortDesc={setUserSortDesc}
                    loading={loading}
                  />
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="fw-semibold"><i className="bi bi-hash me-1"></i>ID</th>
                          <th className="fw-semibold"><i className="bi bi-person me-1"></i>Name</th>
                          <th className="fw-semibold"><i className="bi bi-envelope me-1"></i>Email</th>
                          <th className="fw-semibold"><i className="bi bi-shield me-1"></i>Role</th>
                          <th className="fw-semibold"><i className="bi bi-check-circle me-1"></i>Status</th>
                          <th className="fw-semibold"><i className="bi bi-envelope-check me-1"></i>Email Verified</th>
                          <th className="fw-semibold"><i className="bi bi-info-circle me-1"></i>Additional Data</th>
                          <th className="text-center fw-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => {
                          const role = displayableRole(u.role);
                          const isAdmin = role === 'Admin';
                          const isLoading = actionLoading === u.id;
                          
                          return (
                            <tr key={u.id} style={{ transition: "background-color 0.2s ease" }}>
                              <td className="fw-medium">{u.id}</td>
                              <td>{u.username}</td>
                              <td className="text-muted">{u.email}</td>
                              <td>
                                <span className="badge bg-primary bg-opacity-10 text-primary">
                                  {role}
                                </span>
                              </td>
                              <td>
                                {u.isRestricted ? (
                                  <span className="badge bg-danger">
                                    <i className="bi bi-x-circle me-1"></i>Restricted
                                  </span>
                                ) : (
                                  <span className="badge bg-success">
                                    <i className="bi bi-check-circle me-1"></i>Active
                                  </span>
                                )}
                              </td>
                              <td>
                                {u.isEmailConfirmed ? (
                                  <span className="badge bg-success bg-opacity-10 text-success">
                                    <i className="bi bi-check-circle me-1"></i>Verified
                                  </span>
                                ) : (
                                  <span className="badge bg-warning bg-opacity-10 text-warning">
                                    <i className="bi bi-clock me-1"></i>Pending
                                  </span>
                                )}
                              </td>
                              <td className="text-muted small">
                                {getUserAdditionalData(u)}
                              </td>
                              <td className="text-end">
                                <div className="d-flex gap-1 justify-content-end">
                                    <button
                                      className={`btn btn-sm ${u.isRestricted ? 'btn-outline-success' : 'btn-outline-warning'} d-flex align-items-center`}
                                      onClick={() => handleUserAction(
                                        u.isRestricted ? unrestrictUser : restrictUser,
                                        u.id,
                                        u.isRestricted ? 'unrestricted' : 'restricted'
                                      )}
                                      disabled={loading || isLoading}
                                      title={u.isRestricted ? 'Remove restrictions' : 'Restrict user'}
                                    >
                                      {isLoading ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                      ) : (
                                        <>
                                          <i className={`bi ${u.isRestricted ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                          {u.isRestricted ? 'Release' : 'Restrict'}
                                        </>
                                      )}
                                    </button>
                                  
                                  {isAdmin ?
                                    <button
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                        onClick={() => handleUserAction(
                                          unpromoteAdminToUser,
                                          u.id,
                                          'unpromoted to traveller'
                                        )}
                                        disabled={loading || isLoading}
                                        title="Unpromote to traveller"
                                      >
                                        {isLoading ? (
                                          <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                          <>
                                            <i className="bi bi-arrow-down-circle me-1"></i>
                                            Dissmiss
                                          </>
                                        )}
                                      </button>
                                      : (
                                      <button
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                        onClick={() => handleUserAction(
                                          promoteUserToAdmin,
                                          u.id,
                                          'promoted to admin'
                                        )}
                                        disabled={loading || isLoading}
                                        title="Promote to administrator"
                                      >
                                        {isLoading ? (
                                          <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                          <>
                                            <i className="bi bi-arrow-up-circle me-1"></i>
                                            Promote
                                          </>
                                        )}
                                      </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center text-muted py-4">
                              <i className="bi bi-inbox display-6 d-block mb-2 text-muted"></i>
                              {searchTerm || Object.keys(userFilters).length > 0 
                                ? "No users match your search criteria" 
                                : "No users found"
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </DataCard>
          )}

          {active === "hotels" && (
            <DataCard 
              title="Establishment Management" 
              onRefresh={() => loadAll(true)} 
              loading={loading}
              error={error}
            >
              <SearchAndFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={hotelFilters}
                onFilterChange={handleFilterChange(setHotelFilters)}
                onClearFilters={handleClearFilters(setHotelFilters)}
                filterOptions={hotelFilterOptions}
                loading={loading}
              />

              <ResultsSummary
                total={hotels.length}
                filtered={filteredHotels.length}
                searchTerm={searchTerm}
                hasFilters={Object.keys(hotelFilters).length > 0}
              />

              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <SortControls 
                    label="Sort by ID" 
                    sortDesc={hotelSortDesc} 
                    setSortDesc={setHotelSortDesc}
                    loading={loading}
                  />
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="fw-semibold"><i className="bi bi-hash me-1"></i>ID</th>
                          <th className="fw-semibold"><i className="bi bi-building me-1"></i>Name</th>
                          <th className="fw-semibold"><i className="bi bi-geo-alt me-1"></i>Location</th>
                          <th className="fw-semibold"><i className="bi bi-emoji-smile me-1"></i>Vibe</th>
                          <th className="fw-semibold"><i className="bi bi-houses me-1"></i>Type</th>
                          <th className="fw-semibold"><i className="bi bi-person-badge me-1"></i>Owner</th>
                          <th className="fw-semibold"><i className="bi bi-star me-1"></i>Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHotels.map((h) => (
                          <tr key={h.id} style={{ transition: "background-color 0.2s ease" }}>
                            <td className="fw-medium">{h.id}</td>
                            <td className="fw-medium text-primary">{h.name}</td>
                            <td className="text-muted">{(h.geolocation?.city ? h.geolocation?.city + ', ' : "") + h.geolocation?.country || "—"}</td>
                            <td>
                              <span className="badge bg-primary bg-opacity-10 text-primary">
                                {displayableVibe(h.vibe)}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-primary bg-opacity-10 text-primary">
                                {displayableEstablishmentType(h.type)}
                              </span>
                            </td>
                            <td>{h.owner?.username || "—"}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="me-2">{fmt1(h.rating?.generalRating)}</span>
                                <i className="bi bi-star-fill text-warning"></i>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredHotels.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center text-muted py-4">
                              <i className="bi bi-building display-6 d-block mb-2 text-muted"></i>
                              {searchTerm || Object.keys(hotelFilters).length > 0 
                                ? "No establishments match your search criteria" 
                                : "No establishments found"
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </DataCard>
          )}

          {active === "apartments" && (
            <DataCard 
              title="Apartment Management" 
              onRefresh={() => loadAll(true)} 
              loading={loading}
              error={error}
            >
              <SearchAndFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={apartmentFilters}
                onFilterChange={handleFilterChange(setApartmentFilters)}
                onClearFilters={handleClearFilters(setApartmentFilters)}
                filterOptions={apartmentFilterOptions}
                loading={loading}
              />

              <ResultsSummary
                total={apartments.length}
                filtered={filteredApartments.length}
                searchTerm={searchTerm}
                hasFilters={Object.keys(apartmentFilters).length > 0}
              />

              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <SortControls 
                    label="Sort by ID" 
                    sortDesc={aptSortDesc} 
                    setSortDesc={setAptSortDesc}
                    loading={loading}
                  />
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="fw-semibold"><i className="bi bi-hash me-1"></i>ID</th>
                          <th className="fw-semibold"><i className="bi bi-house-door me-1"></i>Name</th>
                          <th className="fw-semibold"><i className="bi bi-building me-1"></i>Establishment</th>
                          <th className="fw-semibold"><i className="bi bi-people me-1"></i>Capacity</th>
                          <th className="fw-semibold"><i className="bi bi-star me-1"></i>Rating</th>
                          <th className="fw-semibold"><i className="bi bi-currency-euro me-1"></i>Price</th>
                        </tr>
                      </thead>
                    <tbody>
                      {filteredApartments.map(a => (
                        <tr key={a.id} style={{ transition: "background-color 0.2s ease" }}>
                          <td className="fw-medium">{a.id}</td>
                          <td className="fw-medium">{a.name}</td>
                          <td className="text-muted">{a.establishment?.name ?? "—"}</td>
                          <td>
                            <span className="badge bg-info bg-opacity-10 text-info">
                              <i className="bi bi-people-fill me-1"></i>
                              {a.capacity || "—"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{fmt1(a.rating?.generalRating)}</span>
                              <i className="bi bi-star-fill text-warning"></i>
                            </div>
                          </td>
                          <td>
                            {a.price != null ? (
                              <span className="badge bg-success bg-opacity-10 text-success fs-6">
                                €{a.price}
                              </span>
                            ) : "—"}
                          </td>
                        </tr>
                      ))}
                      {filteredApartments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            <i className="bi bi-house-door display-6 d-block mb-2 text-muted"></i>
                            {searchTerm || Object.keys(apartmentFilters).length > 0 
                              ? "No apartments match your search criteria" 
                              : "No apartments found"
                            }
                          </td>
                        </tr>
                      )}
                    </tbody>
                    </table>
                  </div>
                </>
              )}
            </DataCard>
          )}

          {active === "bookings" && (
            <DataCard 
              title="Booking Management" 
              onRefresh={() => loadAll(true)} 
              loading={loading}
              error={error}
            >
              <SearchAndFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={bookingFilters}
                onFilterChange={handleFilterChange(setBookingFilters)}
                onClearFilters={handleClearFilters(setBookingFilters)}
                filterOptions={bookingFilterOptions}
                loading={loading}
              />

              <ResultsSummary
                total={bookings.length}
                filtered={filteredBookings.length}
                searchTerm={searchTerm}
                hasFilters={Object.keys(bookingFilters).length > 0}
              />

              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <SortControls 
                    label="Sort by ID" 
                    sortDesc={bookingSortDesc} 
                    setSortDesc={setBookingSortDesc}
                    loading={loading}
                  />
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="fw-semibold"><i className="bi bi-hash me-1"></i>ID</th>
                          <th className="fw-semibold"><i className="bi bi-person me-1"></i>Guest</th>
                          <th className="fw-semibold"><i className="bi bi-house-door me-1"></i>Apartment</th>
                          <th className="fw-semibold"><i className="bi bi-calendar-event me-1"></i>Check-in</th>
                          <th className="fw-semibold"><i className="bi bi-calendar-x me-1"></i>Check-out</th>
                          <th className="fw-semibold"><i className="bi bi-check-circle me-1"></i>Status</th>
                          <th className="text-end fw-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map(b => (
                          <tr key={b.id} style={{ transition: "background-color 0.2s ease" }}>
                            <td className="fw-medium">{b.id}</td>
                            <td>{b.customer?.username || "—"}</td>
                            <td className="text-primary fw-medium">{b.apartment?.name || "—"}</td>
                            <td>{fmtDate(b.dateFrom)}</td>
                            <td>{fmtDate(b.dateTo)}</td>
                            <td>
                              {b.isCheckedIn ? (
                                <span className="badge bg-success">
                                  <i className="bi bi-check-circle me-1"></i>Checked In
                                </span>
                              ) : (
                                <span className="badge bg-secondary">
                                  <i className="bi bi-clock me-1"></i>Pending
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-danger d-flex align-items-center ms-auto"
                                onClick={() => handleDeleteBooking(b)}
                                disabled={loading}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredBookings.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center text-muted py-4">
                              <i className="bi bi-calendar-x display-6 d-block mb-2 text-muted"></i>
                              {searchTerm || Object.keys(bookingFilters).length > 0 
                                ? "No bookings match your search criteria" 
                                : "No bookings found"
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </DataCard>
          )}

          {active === "payments" && (
            <DataCard 
              title="Payment Management" 
              onRefresh={() => loadAll(true)} 
              loading={loading}
              error={error}
            >
              <SearchAndFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={paymentFilters}
                onFilterChange={handleFilterChange(setPaymentFilters)}
                onClearFilters={handleClearFilters(setPaymentFilters)}
                filterOptions={paymentFilterOptions}
                loading={loading}
              />

              <ResultsSummary
                total={payments.length}
                filtered={filteredPayments.length}
                searchTerm={searchTerm}
                hasFilters={Object.keys(paymentFilters).length > 0}
              />

              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <SortControls 
                    label="Sort by ID" 
                    sortDesc={sortDesc} 
                    setSortDesc={setSortDesc}
                    loading={loading}
                  />
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="fw-semibold"><i className="bi bi-hash me-1"></i>ID</th>
                          <th className="fw-semibold"><i className="bi bi-person me-1"></i>Guest</th>
                          <th className="fw-semibold"><i className="bi bi-house-door me-1"></i>Apartment</th>
                          <th className="fw-semibold"><i className="bi bi-credit-card me-1"></i>Type</th>
                          <th className="fw-semibold"><i className="bi bi-currency-euro me-1"></i>Amount</th>
                          <th className="fw-semibold"><i className="bi bi-check-circle me-1"></i>Status</th>
                          <th className="fw-semibold"><i className="bi bi-calendar me-1"></i>Date</th>
                          <th className="fw-semibold"><i className="bi bi-file-text me-1"></i>Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map(p => {
                          const b = bookingById.get(p.bookingId);
                          return (
                            <tr key={p.id} style={{ transition: "background-color 0.2s ease" }}>
                              <td className="fw-medium">{p.id}</td>
                              <td>{b?.customer?.username || "—"}</td>
                              <td className="text-primary fw-medium">{b?.apartment?.name || "—"}</td>
                              <td>
                                <span className="badge bg-info bg-opacity-10 text-info">
                                  {paymentTypeLabel(p.type)}
                                </span>
                              </td>
                              <td className="fw-medium">
                                {p.amount != null ? `€${p.amount}` : "—"}
                              </td>
                              <td>{badgeByStatus(p.status)}</td>
                              <td className="text-muted">
                                {p.paidAt?.replace("T", " ").slice(0,19) || "—"}
                              </td>
                              <td>
                                {p.invoiceUrl ? (
                                  <a 
                                    href={p.invoiceUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="btn btn-sm btn-outline-primary d-flex align-items-center w-fit"
                                  >
                                    <i className="bi bi-file-text me-1"></i>
                                    View
                                  </a>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {filteredPayments.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center text-muted py-4">
                              <i className="bi bi-credit-card display-6 d-block mb-2 text-muted"></i>
                              {searchTerm || Object.keys(paymentFilters).length > 0 
                                ? "No payments match your search criteria" 
                                : "No payments found"
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </DataCard>
          )}

          {active === "reviews" && (
            <DataCard 
              title="Review Management" 
              onRefresh={() => loadAll(true)} 
              loading={loading}
              error={error}
            >
              <SearchAndFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={reviewFilters}
                onFilterChange={handleFilterChange(setReviewFilters)}
                onClearFilters={handleClearFilters(setReviewFilters)}
                filterOptions={reviewFilterOptions}
                loading={loading}
              />

              <ResultsSummary
                total={reviews.length}
                filtered={filteredReviews.length}
                searchTerm={searchTerm}
                hasFilters={Object.keys(reviewFilters).length > 0}
              />

              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <SortControls 
                    label="Sort by ID" 
                    sortDesc={reviewSortDesc} 
                    setSortDesc={setReviewSortDesc}
                    loading={loading}
                  />
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="fw-semibold"><i className="bi bi-hash me-1"></i>ID</th>
                          <th className="fw-semibold"><i className="bi bi-person me-1"></i>Reviewer</th>
                          <th className="fw-semibold"><i className="bi bi-arrow-right-square me-1"></i>Review on</th>
                          <th className="fw-semibold"><i className="bi bi-star me-1"></i>Rating</th>
                          <th className="fw-semibold"><i className="bi bi-calendar me-1"></i>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReviews.map((r) => (
                          <tr key={r.id} style={{ transition: "background-color 0.2s ease" }}>
                            <td className="fw-medium">{r.id}</td>
                            <td>{r.booking?.customer?.username || r.author?.username || "—"}</td>
                            <td className="text-primary fw-medium">{
                              r.apartmentId
                                ? "Apartment " + r.booking?.apartment?.name
                                : "Customer " + r.booking?.customer?.username}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="me-2 fw-medium">
                                  {typeof r.rating === "number" ? r.rating.toFixed(1) : "—"}
                                </span>
                                {typeof r.rating === "number" && (
                                  <div className="text-warning">
                                    {[...Array(10)].map((_, i) => (
                                      <i 
                                        key={i} 
                                        className={`bi ${i < Math.floor(r.rating) ? 'bi-star-fill' : 'bi-star'}`}
                                      ></i>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="text-muted">
                              {r.createdAt?.replace("T", " ").slice(0, 19) || "—"}
                            </td>
                          </tr>
                        ))}
                        {filteredReviews.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center text-muted py-4">
                              <i className="bi bi-star display-6 d-block mb-2 text-muted"></i>
                              {searchTerm || Object.keys(reviewFilters).length > 0 
                                ? "No reviews match your search criteria" 
                                : "No reviews found"
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </DataCard>
          )}
        </div>

        <CreateAdminModal
          show={showCreateAdminModal}
          onHide={() => setShowCreateAdminModal(false)}
          onConfirm={handleCreateAdmin}
          loading={createAdminLoading}
        />

        <ConfirmationModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete booking #${deleteTarget?.id}? This action cannot be undone.`}
          confirmText="Delete Booking"
          confirmVariant="danger"
        />
      </div>
    </div>
  );
}