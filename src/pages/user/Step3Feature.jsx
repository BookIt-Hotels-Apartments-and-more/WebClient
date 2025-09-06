import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import { ESTABLISHMENT_FEATURE_LABELS } from "../../utils/enums";
import { toast } from "react-toastify";

export default function Step3Feature() {
    const navigate = useNavigate();
    const { features, setFeatures, setStep } = useEstWizard();
    const [errors, setErrors] = useState({});

    const FEATURE_OPTIONS = Object.entries(ESTABLISHMENT_FEATURE_LABELS).map(
        ([label, idx]) => ({
            label,
            value: 1 << idx,
        })
    );

    const validateFeatures = () => { return ""; };

    const validateForm = () => {
        const newErrors = {};

        const featuresError = validateFeatures(features);
        if (featuresError) newErrors.features = featuresError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onBack = () => {
        setStep(2);
        navigate("/add-establishment/step/2");
    };

    const onNext = () => {
        if (!validateForm()) {
            toast.error("Please fix all validation errors before proceeding");
            return;
        }

        const selectedFeatures = FEATURE_OPTIONS.filter(opt => (features & opt.value) !== 0);
        if (selectedFeatures.length === 0) {
            toast.info("You can always add features later in your property settings");
        }

        setStep(4);
        navigate("/add-establishment/step/4");
    };

    const toggle = (bit, checked) => { setFeatures(prev => checked ? (prev | bit) : (prev & ~bit)); };

    const selectedCount = FEATURE_OPTIONS.filter(opt => (features & opt.value) !== 0).length;

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
                What amenities does your property have?
            </h3>

            <div className="mb-3">
                <small className="text-muted">
                    {selectedCount > 0
                        ? `${selectedCount} features selected`
                        : "No features selected (you can add them later)"
                    }
                </small>
            </div>

            <div className="row">
                <div className="col-12 col-md-8">
                    <div className="row">
                        {FEATURE_OPTIONS.map((opt) => (
                            <div key={opt.value} className="col-md-6 col-lg-4 mb-2">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`feature-${opt.value}`}
                                        checked={(features & opt.value) !== 0}
                                        onChange={(e) => toggle(opt.value, e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor={`feature-${opt.value}`}>
                                        {opt.label}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-12 col-md-4 mt-4 mt-md-0">
                    <div className="card" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                        <div className="card-body">
                            <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                Why Features Matter
                            </div>
                            <div className="small text-muted">
                                Features help guests understand what's available at your property.
                                This helps avoid misunderstandings and improves guest satisfaction.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-start mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={onBack}>
                    ← Back
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    style={{ marginLeft: 10, minWidth: 500 }}
                    onClick={onNext}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}