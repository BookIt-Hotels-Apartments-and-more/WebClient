const ReviewDetailsModal = ({ show, onHide, review, onDelete, deleteLoading = false }) => {
  if (!show || !review) return null;

  const renderRatingStars = (rating) => {
    if (!rating) return <span className="text-muted">—</span>;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="d-flex align-items-center">
        <span className="me-2 fw-medium">{rating.toFixed(1)}</span>
        <div className="text-warning">
          {[...Array(10)].map((_, i) => (
            <i 
              key={i} 
              className={`bi ${
                i < fullStars ? 'bi-star-fill' : 
                i === fullStars && hasHalfStar ? 'bi-star-half' : 
                'bi-star'
              }`}
            ></i>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onHide}></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-star-fill me-2 text-warning"></i>
                Review Details
              </h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="text-muted mb-1">Reviewer</h6>
                  <div className="d-flex align-items-center">
                    {review.author?.photos?.[0] && (
                      <img 
                        src={review.author.photos[0]} 
                        alt="Reviewer"
                        className="rounded-circle me-2"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <div className="fw-medium">{review.author?.username || review.booking?.customer?.username || "—"}</div>
                      <small className="text-muted">{review.author?.email || review.booking?.customer?.email || "—"}</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted mb-1">Date</h6>
                  <div>{review.createdAt ? new Date(review.createdAt).toLocaleString() : "—"}</div>
                </div>
              </div>

              {review.isApartmentReview && <div className="card bg-light mb-4">
                <div className="card-body py-3">
                  <h6 className="card-title mb-2">
                    <i className="bi bi-house-door me-1"></i>
                    Apartment: {review.booking?.apartment?.name || "—"}
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted">Establishment:</small>
                      <div>{review.booking?.apartment?.establishment?.name || "—"}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Capacity:</small>
                      <div>{review.booking?.apartment?.capacity || "—"} people</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Price:</small>
                      <div>€{review.booking?.apartment?.price || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>}

              {review.isCustomerReview &&                 <div className="mb-4">
                  <h6 className="text-muted mb-3">Customer Review</h6>
                  
                  <div className="card bg-light mb-3">
                    <div className="card-body py-3">
                      <h6 className="card-title mb-2">
                        <i className="bi bi-person me-1"></i>
                        Reviewed Customer
                      </h6>
                      <div className="d-flex align-items-center">
                        {review.booking?.customer?.photos?.[0] && (
                          <img 
                            src={review.booking.customer.photos[0]} 
                            alt="Customer"
                            className="rounded-circle me-3"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div className="fw-medium">{review.booking?.customer?.username || "—"}</div>
                          <small className="text-muted">{review.booking?.customer?.email || "—"}</small>
                          {review.booking?.customer?.phone && (
                            <div className="small text-muted">
                              <i className="bi bi-telephone me-1"></i>
                              {review.booking.customer.phone}
                            </div>
                          )}
                          {review.booking?.customer?.bio && (
                            <div className="small text-muted mt-1">{review.booking.customer.bio}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}

              <div className="mb-4">
                <h6 className="text-muted mb-2">Overall Rating</h6>
                {renderRatingStars(review.rating)}
              </div>

                <div className="mb-4">
                  <h6 className="text-muted mb-3">Detailed Ratings</h6>
                  <div className="row g-3">
                    {(review.isCustomerReview 
                      ? [{ key: 'customerStayRating', label: 'Customer Stay Rating', icon: 'bi-house-check' }]
                      : review.isApartmentReview
                        ? [ { key: 'comfortRating', label: 'Comfort', icon: 'bi-house-heart' },
                            { key: 'facilitiesRating', label: 'Facilities', icon: 'bi-gear' },
                            { key: 'locationRating', label: 'Location', icon: 'bi-geo-alt' },
                            { key: 'priceQualityRating', label: 'Price/Quality', icon: 'bi-currency-euro' },
                            { key: 'purityRating', label: 'Cleanliness', icon: 'bi-sparkles' },
                            { key: 'staffRating', label: 'Staff', icon: 'bi-people' }]
                        : []
                        )
                      .map(({ key, label, icon }) => (
                      review[key] && (
                        <div key={key} className="col-md-6">
                          <div className="d-flex justify-content-between align-items-center">
                            <span><i className={`${icon} me-1`}></i>{label}</span>
                            <div className="d-flex align-items-center">
                              <span className="me-1 fw-medium">{review[key]}</span>
                              <div className="text-warning">
                                {[...Array(Math.floor(review[key]))].map((_, i) => (
                                  <i key={i} className="bi bi-star-fill" style={{ fontSize: '0.8em' }}></i>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>

              {review.text && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Review</h6>
                  <div className="card">
                    <div className="card-body">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {review.text}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {review.photos && review.photos.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Photos</h6>
                  <div className="row g-2">
                    {review.photos.map((photo, index) => (
                      <div key={index} className="col-md-3">
                        <img 
                          src={photo} 
                          alt={`Review photo ${index + 1}`}
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {review.booking && (
                <div className="card bg-light">
                  <div className="card-body py-3">
                    <h6 className="card-title mb-2">
                      <i className="bi bi-calendar-check me-1"></i>
                      Booking Information
                    </h6>
                    <div className="row">
                      <div className="col-md-4">
                        <small className="text-muted">Check-in:</small>
                        <div>{new Date(review.booking.dateFrom).toLocaleDateString()}</div>
                      </div>
                      <div className="col-md-4">
                        <small className="text-muted">Check-out:</small>
                        <div>{new Date(review.booking.dateTo).toLocaleDateString()}</div>
                      </div>
                      <div className="col-md-4">
                        <small className="text-muted">Status:</small>
                        <div>
                          {review.booking.isCheckedIn ? (
                            <span className="badge bg-success">Checked In</span>
                          ) : (
                            <span className="badge bg-secondary">Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-danger d-flex align-items-center"
                onClick={() => onDelete(review.id)}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-1"></i>
                    Delete Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewDetailsModal;