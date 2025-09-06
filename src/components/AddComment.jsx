import { useState } from "react";
import { createReview } from "../api/reviewApi";
import { toast } from 'react-toastify';

const apartmentCriteria = [
    { key: "Staff", label: "Staff" },
    { key: "Purity", label: "Cleanliness" },
    { key: "PriceQuality", label: "Value for Money" },
    { key: "Comfort", label: "Comfort" },
    { key: "Facilities", label: "Facilities" },
    { key: "Location", label: "Location" },
];

const customerCriteria = [
    { key: "CustomerStay", label: "Guest Behavior" }
];

const MAX_RATING = 10;
const PER_ROW = 5;
const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const AddComment = ({ bookingId, apartmentId, customerId, onClose }) => {
    const [ratings, setRatings] = useState({
        Staff: 0,
        Purity: 0,
        PriceQuality: 0,
        Comfort: 0,
        Facilities: 0,
        Location: 0,
        CustomerStay: 0
    });

    const [form, setForm] = useState({
        comment: ""
    });

    const [newPhotos, setNewPhotos] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const isApartmentReview = Boolean(apartmentId);
    const isCustomerReview = Boolean(customerId);
    const criteria = isApartmentReview ? apartmentCriteria : customerCriteria;

    const validateComment = (comment) => {
        const trimmed = comment.trim();
        if (!trimmed) return "Review comment is required";
        if (trimmed.length < 10) return "Comment must be at least 10 characters long";
        if (trimmed.length > 1000) return "Comment must not exceed 1000 characters";
        return "";
    };

    const validateRatings = (ratings, criteria) => {
        for (const criterion of criteria) {
            if (ratings[criterion.key] === 0) {
                return `Please provide a rating for ${criterion.label}`;
            }
            if (ratings[criterion.key] < 1 || ratings[criterion.key] > MAX_RATING) {
                return `${criterion.label} rating must be between 1 and ${MAX_RATING}`;
            }
        }
        return "";
    };

    const validatePhotos = (photos) => {
        if (photos.length > MAX_PHOTOS) {
            return `Maximum ${MAX_PHOTOS} photos allowed`;
        }
        return "";
    };

    const validateForm = () => {
        const newErrors = {};

        const commentError = validateComment(form.comment);
        if (commentError) newErrors.comment = commentError;

        const ratingsError = validateRatings(ratings, criteria);
        if (ratingsError) newErrors.ratings = ratingsError;

        const photosError = validatePhotos(newPhotos);
        if (photosError) newErrors.photos = photosError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRating = (criterionKey, value) => {
        setRatings(prev => ({ ...prev, [criterionKey]: value }));
        
        if (errors.ratings) {
            setErrors(prev => ({ ...prev, ratings: '' }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        if (errors.comment) {
            setErrors(prev => ({ ...prev, comment: '' }));
        }
    };

    const handlePhotoChange = async (e) => {
        const files = Array.from(e.target.files);
        
        if (newPhotos.length + files.length > MAX_PHOTOS) {
            toast.error(`You can upload maximum ${MAX_PHOTOS} photos`);
            return;
        }

        const validFiles = [];
        
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`File ${file.name} is too large. Maximum size is 5MB`);
                continue;
            }

            if (!file.type.startsWith('image/')) {
                toast.error(`File ${file.name} is not an image`);
                continue;
            }

            try {
                const base64 = await toBase64(file);
                validFiles.push({ file, base64 });
            } catch (error) {
                toast.error(`Failed to process ${file.name}`);
            }
        }

        if (validFiles.length > 0) {
            setNewPhotos(prev => [...prev, ...validFiles]);
            if (errors.photos) {
                setErrors(prev => ({ ...prev, photos: '' }));
            }
            toast.success(`${validFiles.length} photo(s) added successfully`);
        }
    };

    const removePhoto = (index) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const toBase64 = file =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix all validation errors before submitting");
            return;
        }

        setIsSubmitting(true);

        try {
            const reviewData = {
                text: form.comment.trim(),
                bookingId,
                existingPhotosIds: [],
                newPhotosBase64: newPhotos.map(p => p.base64)
            };

            if (isApartmentReview) {
                reviewData.apartmentId = apartmentId;
                reviewData.staffRating = ratings.Staff;
                reviewData.purityRating = ratings.Purity;
                reviewData.priceQualityRating = ratings.PriceQuality;
                reviewData.comfortRating = ratings.Comfort;
                reviewData.facilitiesRating = ratings.Facilities;
                reviewData.locationRating = ratings.Location;
            } else if (isCustomerReview) {
                reviewData.customerId = customerId;
                reviewData.customerStayRating = ratings.CustomerStay;
            }

            await createReview(reviewData);
            toast.success("Thank you for your review!", { autoClose: 4000 });
            onClose && onClose();
        } catch (err) {
            console.error("Failed to submit review:", err);
            toast.error("Failed to submit review. Please try again.", { autoClose: 4000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTenStars = (criterionKey, label) => {
        const currentRating = ratings[criterionKey];
        
        return (
            <div className="mb-4" style={{ minWidth: 280 }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold mb-0" style={{ color: "#4a5568", fontSize: "14px" }}>
                        {label}
                    </label>
                    <span 
                        className="badge bg-primary"
                        style={{ fontSize: "11px", fontWeight: "500" }}
                    >
                        {currentRating}/{MAX_RATING}
                    </span>
                </div>
                
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${PER_ROW}, 1fr)`,
                        gridAutoRows: "32px",
                        gap: "8px",
                        alignItems: "center",
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: currentRating === 0 && errors.ratings ? "1px solid #dc3545" : "1px solid #e9ecef"
                    }}
                >
                    {Array.from({ length: MAX_RATING }, (_, i) => i + 1).map((value) => {
                        const isActive = currentRating >= value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleRating(criterionKey, value)}
                                disabled={isSubmitting}
                                style={{
                                    all: "unset",
                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                    textAlign: "center",
                                    userSelect: "none",
                                    borderRadius: "4px",
                                    transition: "all 0.2s ease",
                                    backgroundColor: isActive ? "#fff3cd" : "transparent",
                                    border: isActive ? "1px solid #ffc107" : "1px solid transparent"
                                }}
                                title={`Rate ${value}/${MAX_RATING} for ${label}`}
                            >
                                <span
                                    style={{
                                        color: isActive ? "#F7B801" : "#CBD5E0",
                                        fontSize: "18px",
                                        transition: "color 0.2s ease",
                                        display: "inline-block",
                                    }}
                                >
                                    ★
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!bookingId) {
        return (
            <div className="alert alert-danger m-4">
                <h5 className="alert-heading">Invalid Review Context</h5>
                <p className="mb-0">Booking ID is required to submit a review. Please try reloading the page.</p>
            </div>
        );
    }

    if (!isApartmentReview && !isCustomerReview) {
        return (
            <div className="alert alert-danger m-4">
                <h5 className="alert-heading">Invalid Review Type</h5>
                <p className="mb-0">Either apartment ID or customer ID must be provided. Please try reloading the page.</p>
            </div>
        );
    }

    return (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 1050
            }}
            onClick={(e) => e.target === e.currentTarget && onClose && onClose()}
        >
            <div 
                className="bg-white rounded-4 shadow-lg"
                style={{
                    width: 'min(95vw, 900px)',
                    maxHeight: '95vh',
                    overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center p-4 border-bottom">
                    <div className="mb-3">
                        <img
                            src="/images/feedback.png"
                            alt="Feedback"
                            style={{ 
                                width: "min(300px, 80%)", 
                                height: "auto",
                                objectFit: "contain",
                                display: "block",
                                margin: "0 auto"
                            }}
                        />
                    </div>
                    <h3 className="mb-2" style={{ fontWeight: 700, color: "#2d3748" }}>
                        {isApartmentReview ? 'Rate Your Stay' : 'Rate Guest Experience'}
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                        {isApartmentReview 
                            ? 'Share your experience to help future guests and improve our service' 
                            : 'Rate this guest based on their behavior during the stay'
                        }
                    </p>
                </div>

                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <h5 className="mb-3" style={{ color: "#2d3748", fontWeight: 600 }}>
                                {isApartmentReview ? 'Rate Different Aspects' : 'Overall Rating'}
                            </h5>
                            
                            {errors.ratings && (
                                <div className="alert alert-warning py-2 mb-3">
                                    <small>{errors.ratings}</small>
                                </div>
                            )}
                            
                            <div className="row">
                                {criteria.map((criterion) => (
                                    <div key={criterion.key} className="col-lg-6 col-xl-4">
                                        {renderTenStars(criterion.key, criterion.label)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold" style={{ color: "#2d3748" }}>
                                Your Review 
                                <span className="text-danger ms-1">*</span>
                            </label>
                            <textarea
                                className={`form-control ${errors.comment ? 'is-invalid' : ''}`}
                                name="comment"
                                value={form.comment}
                                onChange={handleChange}
                                placeholder={isApartmentReview 
                                    ? "Share details about your stay - what you liked, areas for improvement, recommendations for future guests..."
                                    : "Describe your experience with this guest - communication, property care, adherence to rules..."
                                }
                                rows={4}
                                style={{ 
                                    fontSize: "14px",
                                    resize: "vertical",
                                    minHeight: "100px"
                                }}
                                required
                                disabled={isSubmitting}
                            />
                            <div className="d-flex justify-content-between mt-1">
                                <small className="text-muted">
                                    Minimum 10 characters required
                                </small>
                                <small 
                                    className={`${form.comment.length > 900 ? 'text-warning' : 'text-muted'}`}
                                >
                                    {form.comment.trim().length}/1000
                                </small>
                            </div>
                            {errors.comment && (
                                <div className="invalid-feedback">{errors.comment}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold" style={{ color: "#2d3748" }}>
                                Add Photos 
                                <span className="text-muted ms-1">(Optional)</span>
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                className={`form-control ${errors.photos ? 'is-invalid' : ''}`}
                                onChange={handlePhotoChange}
                                disabled={isSubmitting}
                                style={{ fontSize: "14px" }}
                            />
                            <div className="d-flex justify-content-between mt-1">
                                <small className="text-muted">
                                    Supported: JPG, PNG, WebP | Max 5MB each
                                </small>
                                <small className="text-muted">
                                    {newPhotos.length}/{MAX_PHOTOS} photos
                                </small>
                            </div>
                            {errors.photos && (
                                <div className="invalid-feedback">{errors.photos}</div>
                            )}

                            {newPhotos.length > 0 && (
                                <div className="mt-3">
                                    <div className="d-flex flex-wrap gap-2">
                                        {newPhotos.map((photo, index) => (
                                            <div key={index} className="position-relative">
                                                <img
                                                    src={photo.base64}
                                                    alt={`Preview ${index + 1}`}
                                                    style={{
                                                        width: '100px',
                                                        height: '100px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: '2px solid #e9ecef'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                                                    style={{ 
                                                        width: '28px', 
                                                        height: '28px', 
                                                        padding: 0,
                                                        transform: 'translate(10px, -10px)',
                                                        fontSize: '14px',
                                                        lineHeight: 1
                                                    }}
                                                    onClick={() => removePhoto(index)}
                                                    disabled={isSubmitting}
                                                    title="Remove photo"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div 
                            className="d-flex justify-content-end gap-2 pt-3 border-top"
                            style={{ backgroundColor: "#f8f9fa", margin: "-16px", marginTop: "24px", padding: "16px" }}
                        >
                            {onClose && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    style={{ minWidth: "100px" }}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                className="btn"
                                disabled={isSubmitting}
                                style={{
                                    background: "#3CA19A",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    fontWeight: 500,
                                    minWidth: "140px",
                                    boxShadow: "0 2px 8px rgba(60,161,154,0.3)"
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddComment;