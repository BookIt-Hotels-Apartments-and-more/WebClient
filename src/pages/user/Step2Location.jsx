import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import GeoPicker from "../../components/GeoPicker";
import { toast } from "react-toastify";

export default function Step2Location() {
    const navigate = useNavigate();
    const { setStep, geolocation, setGeolocation } = useEstWizard();
    const [errors, setErrors] = useState({});

    const validateLocation = (geolocation) => {
        if (!Array.isArray(geolocation) || geolocation.length !== 2) {
            return "Please select a location on the map";
        }
        if (typeof geolocation[0] !== 'number' || typeof geolocation[1] !== 'number') {
            return "Invalid location coordinates";
        }
        if (geolocation[0] < -90 || geolocation[0] > 90) {
            return "Invalid latitude coordinate";
        }
        if (geolocation[1] < -180 || geolocation[1] > 180) {
            return "Invalid longitude coordinate";
        }
        return "";
    };

    const validateForm = () => {
        const newErrors = {};

        const locationError = validateLocation(geolocation);
        if (locationError) newErrors.location = locationError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLocationChange = (newLocation) => {
        setGeolocation(newLocation);

        if (errors.location && Array.isArray(newLocation) && newLocation.length === 2) {
            setErrors(prev => ({ ...prev, location: '' }));
        }
    };

    const canNext = Array.isArray(geolocation) && geolocation.length === 2;

    const next = () => {
        if (!validateForm()) {
            toast.error("Please select a valid location on the map");
            return;
        }

        setStep(3);
        navigate("/add-establishment/step/3");
    };

    const back = () => {
        setStep(1);
        navigate("/add-establishment/step/1");
    };

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
            <h3 className="mb-3" style={{ color: "#FA7E1E" }}>
                Where is your property located?
            </h3>

            <div className="mb-3">
                <label className="form-label fw-semibold">Select Location on Map</label>
                <div className={`position-relative ${errors.location ? 'border border-danger rounded' : ''}`}>
                    <GeoPicker
                        value={geolocation || [50.45, 30.52]}
                        onChange={handleLocationChange}
                    />
                </div>

                <div className="d-flex justify-content-between mt-2">
                    <small className="text-muted">
                        {Array.isArray(geolocation) && geolocation.length === 2
                            ? `Selected: Lat ${geolocation[0].toFixed(5)}, Lng ${geolocation[1].toFixed(5)}`
                            : "Click on the map to select your property location"
                        }
                    </small>
                    {canNext && (
                        <small className="text-success">
                            ✓ Location selected
                        </small>
                    )}
                </div>

                {errors.location && (
                    <div className="text-danger small mt-1">
                        {errors.location}
                    </div>
                )}
            </div>

            <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                    <div className="card h-100" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                        <div className="card-body">
                            <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                💡 Location Tips
                            </div>
                            <ul className="mb-0 small" style={{ color: "#22614D" }}>
                                <li>Be as precise as possible</li>
                                <li>Pin the exact building location</li>
                                <li>Consider guest accessibility</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className="card h-100" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                        <div className="card-body">
                            <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                🗺️ Why Location Matters
                            </div>
                            <div className="small text-muted">
                                Guests need to find your property easily. A precise location helps with navigation and builds trust.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-start mt-4">
                <button className="btn btn-outline-secondary" onClick={back}>
                    ← Back
                </button>
                <button className="btn btn-primary" style={{ marginLeft: 10, minWidth: 500 }} onClick={next} disabled={!canNext}>
                    Next →
                </button>
            </div>
        </div>
    );
}