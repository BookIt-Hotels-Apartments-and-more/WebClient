import { useEffect, useState, useCallback } from "react";
import {
  getApartmentsByEstablishment,
  deleteApartment,
} from "../../api/apartmentApi";
import {
  deleteBooking,
  checkInBooking,
  getFilteredBookings
} from "../../api/bookingApi";
import { getFilteredReviews } from "../../api/reviewApi";
import { deleteEstablishment } from "../../api/establishmentsApi";
import { Link } from "react-router-dom";
import { APARTMENT_FEATURE_LABELS, ESTABLISHMENT_FEATURE_LABELS, decodeFlagsUser } from "../../utils/enums";
import { toast } from "react-toastify";
import AddComment from "../../components/AddComment";

const CustomerDetailsModal = ({ customer, isOpen, onClose }) => {
  if (!isOpen || !customer) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white rounded-4 shadow-lg p-4"
        style={{
          width: 'min(90vw, 500px)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Customer Details</h4>
          <button 
            className="btn btn-outline-secondary btn-sm rounded-circle"
            onClick={onClose}
            style={{ width: '32px', height: '32px' }}
          >
            ✕
          </button>
        </div>

        <div className="row g-3">
          {customer.photos?.length > 0 && (
            <div className="col-12 text-center">
              <img 
                src={customer.photos[0]} 
                alt={customer.username}
                className="rounded-circle border"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
            </div>
          )}

          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-sm-4"><strong>Username:</strong></div>
                  <div className="col-sm-8">{customer.username}</div>
                  
                  <div className="col-sm-4"><strong>Email:</strong></div>
                  <div className="col-sm-8">
                    <a href={`mailto:${customer.email}`} className="text-decoration-none">
                      {customer.email}
                    </a>
                  </div>
                  
                  {customer.phoneNumber && (
                    <>
                      <div className="col-sm-4"><strong>Phone:</strong></div>
                      <div className="col-sm-8">
                        <a href={`tel:${customer.phoneNumber}`} className="text-decoration-none">
                          {customer.phoneNumber}
                        </a>
                      </div>
                    </>
                  )}
                  
                  {customer.rating?.customerStayRating && (
                    <>
                      <div className="col-sm-4"><strong>Rating:</strong></div>
                      <div className="col-sm-8">
                        <span className="badge bg-primary">
                          {customer.rating.customerStayRating.toFixed(1)}/10
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const LandEstablishmentCard = ({ est, reloadStats }) => {
  const [apartments, setApartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allApts, reviewsData, bookings] = await Promise.all([getApartmentsByEstablishment(est.id),
                                                                  getFilteredReviews({establishmentId: est.id}),
                                                                  getFilteredBookings({establishmentId: est.id})]);

      setApartments(Array.isArray(allApts) ? allApts : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setBookings(Array.isArray(bookings) ? bookings : []);
    } catch (err) {
      console.error("❌ Error while loading:", err);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [est.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fmt1 = (v) => (typeof v === "number" && !Number.isNaN(v))
    ? v.toFixed(1) : (v != null && !Number.isNaN(Number(v)) ? Number(v).toFixed(1) : "—");

  const handleDeleteHotel = async () => {
    if (window.confirm("Are you sure you want to delete this hotel? This action cannot be undone.")) {
      try {
        await deleteEstablishment(est.id);
        toast.success("Hotel deleted successfully");
        reloadStats();
      } catch { toast.error("Failed to delete hotel"); }
    }
  };

  const handleDeleteApartment = async (id) => {
    if (window.confirm("Are you sure you want to delete this apartment?")) {
      try {
        await deleteApartment(id);
        toast.success("Apartment deleted successfully");
        await loadData();
        if (reloadStats) reloadStats();
      } catch { toast.error("Failed to delete apartment"); }
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await checkInBooking(bookingId);
      toast.success("Booking checked in successfully");
      await loadData();
    } catch { toast.error("Failed to check in booking"); }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await deleteBooking(bookingId);
        toast.success("Booking cancelled successfully");
        await loadData();
      } catch { toast.error("Failed to cancel booking"); }
    }
  };

  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : "";
  const isDatePassed = (dateStr) => new Date(dateStr) < new Date();

  const handleViewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleRateCustomer = (booking) => {
    setSelectedBookingForReview(booking);
    setShowReviewModal(true);
  };

  if (isLoading) {
    return (
      <div className="card mb-4 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading property data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 className="card-title text-primary fw-bold mb-2">{est.name}</h4>
              <div className="d-flex align-items-center gap-3 text-muted small">
                <span>📍 {est.location}</span>
                <span>🏨 {apartments.length} apartment{apartments.length !== 1 ? 's' : ''}</span>
                <span>📅 {bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
                <span>⭐ {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Link
                to={`/edit-hotel/${est.id}`}
                className="btn btn-outline-primary btn-sm"
              >
                ✏️ Edit
              </Link>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleDeleteHotel}
              >
                🗑️ Delete
              </button>
            </div>
          </div>

          {est.description && (
            <p className="text-muted mb-3">{est.description}</p>
          )}

          {est.photos && est.photos.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">Hotel Photos</h6>
              <div className="d-flex flex-wrap gap-2">
                {est.photos.map((photo, idx) => (
                  <img
                    key={photo.id || photo.blobUrl || idx}
                    src={photo.blobUrl}
                    alt="Hotel"
                    className="rounded shadow-sm"
                    style={{
                      width: '100px',
                      height: '75px',
                      objectFit: 'cover',
                      border: '2px solid #e9ecef'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Hotel Facilities</h6>
            {(() => {
              let featureNames = [];

              if (typeof est?.features === "number") {
                featureNames = decodeFlagsUser(est.features, ESTABLISHMENT_FEATURE_LABELS);
              } else if (est?.features && typeof est.features === "object") {
                featureNames = Object.keys(ESTABLISHMENT_FEATURE_LABELS).filter(k =>
                  est.features[k.charAt(0).toLowerCase() + k.slice(1)]
                );
              }

              if (featureNames.length === 0) {
                return <div className="text-muted">No facilities specified</div>;
              }

              return (
                <div className="d-flex flex-wrap gap-2">
                  {featureNames.map((name) => (
                    <span
                      key={name}
                      className="badge bg-light text-dark border d-flex align-items-center gap-1"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      <img
                        src={`/images/features/${name}.png`}
                        alt={name}
                        style={{ width: 16, height: 16 }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      {name.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          <hr className="my-4" />

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">Apartments ({apartments.length})</h5>
            <Link
              to={`/add-apartment/${est.id}`}
              className="btn btn-success btn-sm">
              ➕ Add Apartment
            </Link>
          </div>

          {apartments.length === 0 ? (
            <div className="text-center py-4 bg-light rounded">
              <p className="text-muted mb-2">No apartments added yet</p>
            </div>
          ) : (
            <div className="row g-3 mb-4">
              {apartments.map((apt) => (
                <div key={apt.id} className="col-lg-6">
                  <div className="card border">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-1">{apt.name}</h6>
                        <div className="dropdown">
                          <button
                            className="btn btn-outline-secondary btn-sm dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            Actions
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <Link
                                to={`/edit-apartment/${apt.id}`}
                                className="dropdown-item"
                              >
                                ✏️ Edit
                              </Link>
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleDeleteApartment(apt.id)}
                              >
                                🗑️ Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <small className="text-muted">Area:</small>
                          <div className="fw-semibold">{apt.area} m²</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Price:</small>
                          <div className="fw-semibold text-success">${apt.price}/night</div>
                        </div>
                      </div>

                      {apt.description && (
                        <p className="text-muted small mb-2">{apt.description}</p>
                      )}

                      {apt.photos && apt.photos.length > 0 && (
                        <div className="mb-2">
                          <div className="d-flex gap-1 flex-wrap">
                            {apt.photos.slice(0, 4).map((photo, idx) => (
                              <img
                                key={photo.id || photo.blobUrl || idx}
                                src={photo.blobUrl}
                                alt="Apartment"
                                className="rounded"
                                style={{
                                  width: '50px',
                                  height: '40px',
                                  objectFit: 'cover',
                                  border: '1px solid #e0e0e0'
                                }}
                              />
                            ))}
                            {apt.photos.length > 4 && (
                              <div
                                className="d-flex align-items-center justify-content-center bg-light rounded text-muted small"
                                style={{ width: '50px', height: '40px' }}
                              >
                                +{apt.photos.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(() => {
                        let featureNames = [];
                        if (typeof apt?.features === "number") {
                          featureNames = decodeFlagsUser(apt.features, APARTMENT_FEATURE_LABELS);
                        } else if (apt?.features && typeof apt.features === "object") {
                          featureNames = Object.keys(APARTMENT_FEATURE_LABELS).filter(k =>
                            apt.features[k.charAt(0).toLowerCase() + k.slice(1)]
                          );
                        }

                        if (featureNames.length === 0) {
                          return <small className="text-muted">No specific facilities</small>;
                        }

                        return (
                          <div className="d-flex flex-wrap gap-1">
                            {featureNames.slice(0, 3).map((name) => (
                              <span
                                key={name}
                                className="badge bg-secondary"
                                style={{ fontSize: '10px' }}
                              >
                                {name.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                            ))}
                            {featureNames.length > 3 && (
                              <span className="badge bg-light text-dark" style={{ fontSize: '10px' }}>
                                +{featureNames.length - 3} more
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr className="my-4" />

          <h5 className="fw-semibold mb-3">Bookings ({bookings.length})</h5>
          {bookings.length === 0 ? (
            <div className="text-center py-4 bg-light rounded">
              <p className="text-muted mb-0">No bookings yet</p>
            </div>
          ) : (
            <div className="list-group mb-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <strong>{booking.customer.username}</strong>
                        <span className="text-muted">•</span>
                        <span className="text-muted">
                          {formatDate(booking.dateFrom)} → {formatDate(booking.dateTo)}
                        </span>
                        {booking.isCheckedIn && (
                          <span className="badge bg-success ms-2">Checked In</span>
                        )}
                        {!booking.isCheckedIn &&
                         isDatePassed(booking.dateFrom) &&
                         !isDatePassed(booking.dateTo) &&
                         (
                          <span
                            className="badge bg-primary ms-2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleCheckIn(booking.id)}
                          >
                            Check In
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="d-flex gap-1 flex-wrap">                      
                      <button
                        className="btn btn-outline-info btn-sm"
                        onClick={() => handleViewCustomerDetails(booking.customer)}
                      >
                        👤 Details
                      </button>
                      
                      {isDatePassed(booking.dateTo) && !booking.hasLandlordReviewed && (
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => handleRateCustomer(booking)}
                        >
                          Review
                        </button>
                      )}
                      
                      {!isDatePassed(booking.dateFrom) &&
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </button>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr className="my-4" />

          <h5 className="fw-semibold mb-3">Reviews ({reviews.length})</h5>
          {reviews.length === 0 ? (
            <div className="text-center py-4 bg-light rounded">
              <p className="text-muted mb-0">No reviews yet</p>
            </div>
          ) : (
            <div className="list-group">
              {reviews.map((review) => (
                <div key={review.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-warning text-dark">
                          ⭐ {fmt1(review.rating)}/10
                        </span>
                        <small className="text-muted">
                          by {review.booking?.customer?.username || 'Anonymous'}
                        </small>
                      </div>
                      <p className="mb-0">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
      />

      {showReviewModal && selectedBookingForReview && (
        <AddComment
          bookingId={selectedBookingForReview.id}
          customerId={selectedBookingForReview.customer.id}
          onClose={() => {
            setShowReviewModal(false);
            const reviewedBooking = bookings.find(b => b.id === selectedBookingForReview.id);
            if (reviewedBooking) reviewedBooking.hasLandlordReviewed = true;
            setSelectedBookingForReview(null);
          }}
        />
      )}
    </>
  );
};

export default LandEstablishmentCard;