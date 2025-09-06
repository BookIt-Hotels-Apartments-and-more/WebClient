import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import { createEstablishment } from "../../api/establishmentsApi";
import { ESTABLISHMENT_TYPE_LABELS, ESTABLISHMENT_FEATURE_LABELS } from "../../utils/enums";
import { toast } from "react-toastify";

export default function Step6Publication() {
    const navigate = useNavigate();
    const {
        setStep,
        propertyType,
        name,
        geolocation,
        features,
        description,
        checkIn,
        checkOut,
        photoData,
        ownerId,
        reset,
    } = useEstWizard();

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const typeName = useMemo(() => {
        const entry = Object.entries(ESTABLISHMENT_TYPE_LABELS).find(([, v]) => v === propertyType);
        return entry ? entry[0] : "—";
    }, [propertyType]);

    const featureList = useMemo(() => {
        const list = [];
        for (const [key, bitIndex] of Object.entries(ESTABLISHMENT_FEATURE_LABELS)) {
            const bit = 1 << bitIndex;
            if ((features & bit) !== 0) list.push(key);
        }
        return list;
    }, [features]);

    const validateName = (name) => {
        const trimmedName = name?.trim() || "";
        if (!trimmedName) return "Hotel name is required";
        if (trimmedName.length < 10) return "Hotel name must be at least 10 characters long";
        if (trimmedName.length > 100) return "Hotel name must not exceed 100 characters";
        return "";
    };

    const validateDescription = (description) => {
        const trimmedDesc = description?.trim() || "";
        if (!trimmedDesc) return "Description is required";
        if (trimmedDesc.length < 50) return "Description must be at least 50 characters long";
        if (trimmedDesc.length > 200) return "Description must not exceed 200 characters";
        return "";
    };

    const validatePropertyType = (propertyType) => {
        if (!Number.isInteger(propertyType)) return "Please select a property type";
        return "";
    };

    const validateLocation = (geolocation) => {
        if (!Array.isArray(geolocation) || geolocation.length !== 2) {
            return "Please select a location on the map";
        }
        return "";
    };

    const validateCheckInTime = (checkIn) => {
        if (!checkIn || typeof checkIn.hour !== 'number') return "Check-in time is required";
        if (checkIn.hour < 12 || checkIn.hour > 23) return "Check-in time must be between 12:00 and 23:00";
        return "";
    };

    const validateCheckOutTime = (checkOut) => {
        if (!checkOut || typeof checkOut.hour !== 'number') return "Check-out time is required";
        if (checkOut.hour < 6 || checkOut.hour > 12) return "Check-out time must be between 6:00 and 12:00";
        return "";
    };

    const validateTimeGap = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return "";

        const checkInMinutes = checkIn.hour * 60 + (checkIn.minute || 0);
        const checkOutMinutes = checkOut.hour * 60 + (checkOut.minute || 0);

        let gap = checkInMinutes - checkOutMinutes;
        if (gap < 0) gap += 24 * 60;

        if (gap < 60) {
            return "Check-in time must be at least 1 hour after check-out time";
        }
        return "";
    };

    const validatePhotos = (photoData) => {
        if (!Array.isArray(photoData) || photoData.length === 0) {
            return "At least 1 photo is required";
        }
        return "";
    };

    const validateForm = () => {
        const newErrors = {};

        const nameError = validateName(name);
        if (nameError) newErrors.name = nameError;

        const descError = validateDescription(description);
        if (descError) newErrors.description = descError;

        const typeError = validatePropertyType(propertyType);
        if (typeError) newErrors.propertyType = typeError;

        const locationError = validateLocation(geolocation);
        if (locationError) newErrors.location = locationError;

        const checkInError = validateCheckInTime(checkIn);
        if (checkInError) newErrors.checkIn = checkInError;

        const checkOutError = validateCheckOutTime(checkOut);
        if (checkOutError) newErrors.checkOut = checkOutError;

        if (!checkInError && !checkOutError) {
            const timeGapError = validateTimeGap(checkIn, checkOut);
            if (timeGapError) newErrors.timeGap = timeGapError;
        }

        const photosError = validatePhotos(photoData);
        if (photosError) newErrors.photos = photosError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBackendErrors = (error) => {
        if (error.response?.data?.errors) {
            const backendErrors = error.response.data.errors;
            const newErrors = {};

            Object.keys(backendErrors).forEach(key => {
                const fieldName = key.toLowerCase();
                if (backendErrors[key] && backendErrors[key].length > 0) {
                    newErrors[fieldName] = backendErrors[key][0];
                    toast.error(`${key}: ${backendErrors[key][0]}`);
                }
            });

            setErrors(prev => ({ ...prev, ...newErrors }));

            const errorFields = Object.keys(newErrors);
            if (errorFields.includes('name')) {
                toast.info("Please go back to Step 1 to fix the property name");
            }
            if (errorFields.includes('description')) {
                toast.info("Please go back to Step 4 to fix the description");
            }
            if (errorFields.includes('latitude') || errorFields.includes('longitude')) {
                toast.info("Please go back to Step 2 to fix the location");
            }

        } else {
            toast.error("Error creating property. Please try again.");
        }
    };

    const hhmm = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

    const onBack = () => {
        setStep(5);
        navigate("/add-establishment/step/5");
    };

    const onSubmit = async (redirectTo) => {
        setErrors({});

        if (!validateForm()) {
            toast.error("Please fix all validation errors before submitting");
            return;
        }

        try {
            setSubmitting(true);

            const newPhotosBase64 = photoData.map(photo => photo.base64);

            const payload = {
                name: name.trim(),
                description: description.trim(),
                type: propertyType,
                features,
                checkInTime: hhmm(checkIn?.hour ?? 14, checkIn?.minute ?? 0),
                checkOutTime: hhmm(checkOut?.hour ?? 12, checkOut?.minute ?? 0),
                latitude: geolocation[0],
                longitude: geolocation[1],
                ownerId,
                existingPhotosIds: [],
                newPhotosBase64
            };

            const res = await createEstablishment(payload);
            const id = res?.id;

            toast.success("Property created successfully!");

            if (redirectTo === "add-apartments" && id) {
                navigate(`/add-apartment/${id}`)
                setTimeout(() => reset(), 100);
            } else {
                navigate("/accounthome");
                setTimeout(() => reset(), 100);
            }
        } catch (error) {
            console.error("❌ Error creating establishment:", error);
            handleBackendErrors(error);
        } finally {
            setSubmitting(false);
        }
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div
            style={{
                background: "rgba(255,255,255,0.95)",
                borderRadius: 16,
                padding: 24,
                width: "100%",
                maxWidth: 1100,
                boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
            }}
        >
            {hasErrors && (
                <div className="alert alert-danger mb-4">
                    <h6 className="alert-heading">⚠️ Please fix the following issues:</h6>
                    <ul className="mb-0">
                        {Object.entries(errors).map(([field, error]) => (
                            <li key={field}><strong>{field}:</strong> {error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="row g-4">
                <div className="col-12 col-md-7">
                    <h3 className="mb-3" style={{ color: "#FA7E1E" }}>
                        Review & publish
                    </h3>

                    <div className={`mb-3 ${errors.propertyType ? 'border border-danger rounded p-2' : ''}`}>
                        <div className="fw-semibold">Type</div>
                        <div className="text-muted">{typeName}</div>
                        {errors.propertyType && <small className="text-danger">{errors.propertyType}</small>}
                    </div>

                    <div className={`mb-3 ${errors.name ? 'border border-danger rounded p-2' : ''}`}>
                        <div className="fw-semibold">Name</div>
                        <div className="text-muted">{name || "—"}</div>
                        {errors.name && <small className="text-danger">{errors.name}</small>}
                    </div>

                    <div className={`mb-3 ${errors.location ? 'border border-danger rounded p-2' : ''}`}>
                        <div className="fw-semibold">Location</div>
                        <div className="text-muted">
                            {Array.isArray(geolocation)
                                ? `Lat: ${geolocation[0].toFixed(5)}, Lng: ${geolocation[1].toFixed(5)}`
                                : "—"}
                        </div>
                        {errors.location && <small className="text-danger">{errors.location}</small>}
                    </div>

                    <div className="mb-3">
                        <div className="fw-semibold">Features</div>
                        <div className="text-muted">{featureList.length ? featureList.join(", ") : "None selected"}</div>
                    </div>

                    <div className={`mb-3 ${errors.description ? 'border border-danger rounded p-2' : ''}`}>
                        <div className="fw-semibold">Description</div>
                        <div className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
                            {description || "—"}
                        </div>
                        {errors.description && <small className="text-danger">{errors.description}</small>}
                    </div>

                    <div className={`mb-3 ${errors.checkIn || errors.checkOut || errors.timeGap ? 'border border-danger rounded p-2' : ''}`}>
                        <div className="fw-semibold">Check-in / Check-out</div>
                        <div className="text-muted">
                            {hhmm(checkIn?.hour ?? 14, checkIn?.minute ?? 0)} — {hhmm(checkOut?.hour ?? 12, checkOut?.minute ?? 0)}
                        </div>
                        {errors.checkIn && <small className="text-danger d-block">{errors.checkIn}</small>}
                        {errors.checkOut && <small className="text-danger d-block">{errors.checkOut}</small>}
                        {errors.timeGap && <small className="text-danger d-block">{errors.timeGap}</small>}
                    </div>

                    <div className={`mb-3 ${errors.photos ? 'border border-danger rounded p-2' : ''}`}>
                        <div className="fw-semibold">Photos ({photoData?.length || 0})</div>
                        {Array.isArray(photoData) && photoData.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {photoData.map((photo) => (
                                    <div key={photo.id} className="position-relative">
                                        <img
                                            src={photo.preview}
                                            alt={photo.name}
                                            style={{
                                                width: 96,
                                                height: 96,
                                                objectFit: "cover",
                                                borderRadius: 8,
                                                border: "1px solid #e6eef4"
                                            }}
                                        />
                                        <div 
                                            className="position-absolute bottom-0 start-0 bg-dark bg-opacity-75 text-white px-1 rounded-end"
                                            style={{ fontSize: '9px' }}
                                        >
                                            {(photo.size / 1024 / 1024).toFixed(1)}MB
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted">No photos uploaded</div>
                        )}
                        {errors.photos && <small className="text-danger d-block mt-1">{errors.photos}</small>}
                    </div>
                </div>

                <div className="col-12 col-md-5">
                    <div className="card mb-3" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                        <div className="card-body">
                            <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                ✅ Pre-publication Checklist
                            </div>
                            <ul className="mb-0 small" style={{ color: "#22614D" }}>
                                <li className={name && validateName(name) === "" ? "text-success" : ""}>
                                    Property name is descriptive and accurate
                                    {name && validateName(name) === "" && <span className="text-success ms-1">✓</span>}
                                </li>
                                <li className={geolocation && validateLocation(geolocation) === "" ? "text-success" : ""}>
                                    Location is precisely marked
                                    {geolocation && validateLocation(geolocation) === "" && <span className="text-success ms-1">✓</span>}
                                </li>
                                <li className={checkIn && checkOut && validateCheckInTime(checkIn) === "" && validateCheckOutTime(checkOut) === "" ? "text-success" : ""}>
                                    Check-in/out times are realistic
                                    {checkIn && checkOut && validateCheckInTime(checkIn) === "" && validateCheckOutTime(checkOut) === "" && <span className="text-success ms-1">✓</span>}
                                </li>
                                <li className={description && validateDescription(description) === "" ? "text-success" : ""}>
                                    Description highlights unique features
                                    {description && validateDescription(description) === "" && <span className="text-success ms-1">✓</span>}
                                </li>
                                <li className={photoData && validatePhotos(photoData) === "" ? "text-success" : ""}>
                                    Photos showcase your property well
                                    {photoData && validatePhotos(photoData) === "" && <span className="text-success ms-1">✓</span>}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {hasErrors && (
                        <div className="card" style={{ borderRadius: 12, border: "1px solid #dc3545" }}>
                            <div className="card-body">
                                <div className="fw-bold mb-2 text-danger">
                                    🚨 Action Required
                                </div>
                                <div className="small text-muted">
                                    Please use the "← Back" button to navigate to the appropriate steps
                                    and fix the validation errors before publishing.
                                </div>
                            </div>
                        </div>
                    )}

                    {!hasErrors && (
                        <div className="card" style={{ borderRadius: 12, border: "1px solid #28a745" }}>
                            <div className="card-body">
                                <div className="fw-bold mb-2 text-success">
                                    🎉 Ready to Publish!
                                </div>
                                <div className="small text-muted">
                                    All requirements are met. Your property is ready to be published 
                                    and will be visible to potential guests.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="d-flex justify-content-between mt-4 flex-wrap gap-2">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onBack}
                    disabled={submitting}
                >
                    ← Back
                </button>

                <div className="d-flex gap-2 flex-wrap">
                    <button
                        type="button"
                        className="btn btn-success"
                        style={{ minWidth: 200 }}
                        onClick={() => onSubmit("add-apartments")}
                        disabled={submitting || hasErrors}
                    >
                        {submitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Publishing...
                            </>
                        ) : (
                            "✚ Publish & Add Apartments"
                        )}
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary"
                        style={{ minWidth: 200 }}
                        onClick={() => onSubmit("accounthome")}
                        disabled={submitting || hasErrors}
                    >
                        {submitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Publishing...
                            </>
                        ) : (
                            "📋 Publish & Go to Dashboard"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}