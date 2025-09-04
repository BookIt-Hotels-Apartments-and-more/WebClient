import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import WizardProgress from "./WizardProgress";

export default function Step4Description() {
    const navigate = useNavigate();
    const {
        setStep,
        description,
        setDescription,
        checkIn,
        setCheckIn,
        checkOut,
        setCheckOut,
        name,
        setName,
    } = useEstWizard();

    const [checkInHour, setCheckInHour] = useState(checkIn?.hour ?? 14);
    const [checkInMinute, setCheckInMinute] = useState(checkIn?.minute ?? 0);
    const [checkOutHour, setCheckOutHour] = useState(checkOut?.hour ?? 12);
    const [checkOutMinute, setCheckOutMinute] = useState(checkOut?.minute ?? 0);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!checkIn)  setCheckIn({ hour: 14, minute: 0 });
        if (!checkOut) setCheckOut({ hour: 12, minute: 0 });
        setCheckIn({ hour: checkInHour, minute: checkInMinute });
        setCheckOut({ hour: checkOutHour, minute: checkOutMinute });
    }, [checkInHour, checkInMinute, checkOutHour, checkOutMinute, setCheckIn, setCheckOut]);

    useEffect(() => {
        if (setName && !name) {
            setStep(1);
            navigate("/add-establishment/step-1");
        }
    }, [setName, name, setStep, navigate]);

    const validateDescription = (description) => {
        const trimmedDesc = description?.trim() || "";
        if (!trimmedDesc) return "Description is required";
        if (trimmedDesc.length < 50) return "Description must be at least 50 characters long";
        if (trimmedDesc.length > 200) return "Description must not exceed 200 characters";
        return "";
    };

    const validateCheckOutTime = (hour) => {
        if (hour < 6) return "Check-out time must be between 6:00 and 12:00";
        if (hour > 12) return "Check-out time must be between 6:00 and 12:00";
        return "";
    };

    const validateCheckInTime = (hour) => {
        if (hour < 12) return "Check-in time must be between 12:00 and 23:00";
        if (hour > 23) return "Check-in time must be between 12:00 and 23:00";
        return "";
    };

    const validateTimeGap = (checkInH, checkInM, checkOutH, checkOutM) => {
        const checkInMinutes = checkInH * 60 + checkInM;
        const checkOutMinutes = checkOutH * 60 + checkOutM;
        
        let gap = checkInMinutes - checkOutMinutes;
        if (gap < 0) gap += 24 * 60;
        
        if (gap < 60) {
            return "Check-in time must be at least 1 hour after check-out time";
        }
        return "";
    };

    const validateForm = () => {
        const newErrors = {};
        
        const descError = validateDescription(description);
        if (descError) newErrors.description = descError;
        
        const checkOutError = validateCheckOutTime(checkOutHour);
        if (checkOutError) newErrors.checkOutTime = checkOutError;
        
        const checkInError = validateCheckInTime(checkInHour);
        if (checkInError) newErrors.checkInTime = checkInError;
        
        if (!checkInError && !checkOutError) {
            const timeGapError = validateTimeGap(checkInHour, checkInMinute, checkOutHour, checkOutMinute);
            if (timeGapError) newErrors.timeGap = timeGapError;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        
        if (errors.description) {
            setErrors(prev => ({ ...prev, description: '' }));
        }
    };

    const handleCheckInHourChange = (newHour) => {
        setCheckInHour(newHour);
        setErrors(prev => ({ 
            ...prev, 
            checkInTime: '', 
            timeGap: '' 
        }));
    };

    const handleCheckInMinuteChange = (newMinute) => {
        setCheckInMinute(newMinute);
        setErrors(prev => ({ ...prev, timeGap: '' }));
    };

    const handleCheckOutHourChange = (newHour) => {
        setCheckOutHour(newHour);
        setErrors(prev => ({ 
            ...prev, 
            checkOutTime: '', 
            timeGap: '' 
        }));
    };

    const handleCheckOutMinuteChange = (newMinute) => {
        setCheckOutMinute(newMinute);
        setErrors(prev => ({ ...prev, timeGap: '' }));
    };

    const onBack = () => {
        setStep(3);
        navigate("/add-establishment/step-3");
    };

    const onNext = () => {
        if (!validateForm()) {
            toast.error("Please fix all validation errors before proceeding");
            return;
        }
        
        setStep(5);
        navigate("/add-establishment/step-5");
    };

    return (
        <div
            style={{
                position: "relative",
                minHeight: "100vh",
                zIndex: 2,
                paddingBottom: 40,
                marginTop: -110,
            }}
        >
            <div
                style={{
                    position: "relative",
                    overflow: "hidden",
                    paddingTop: 32,
                    paddingBottom: 20,
                    background:
                        "linear-gradient(180deg, rgba(3,173,179,0.18) 0%, rgba(214,231,238,1) 30%, rgba(214,231,238,0) 50%)",
                }}
            >
                <div className="container" style={{ width: 2200, marginTop: 130 }}>
                    <WizardProgress current={4} />
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
                        <h3 className="mb-4" style={{ color: "#FA7E1E" }}>
                            Property description & check-in rules
                        </h3>

                        <div className="row">
                            <div className="col-12 col-md-8">
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Property Description</label>
                                    <textarea
                                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                        rows={5}
                                        placeholder="Describe your property in detail..."
                                        value={description || ""}
                                        onChange={handleDescriptionChange}
                                        required
                                    />
                                    <small className="text-muted">
                                        Description must be 50-200 characters long ({(description?.trim().length) || 0}/200)
                                    </small>
                                    {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                                </div>

                                <div className="mb-4">
                                    {errors.timeGap && (
                                        <div className="alert alert-warning py-2 mb-3">
                                            {errors.timeGap}
                                        </div>
                                    )}
                                    
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">Check-in time</label>
                                            <div className="d-flex gap-2" style={{ maxWidth: 200 }}>
                                                <select
                                                    className={`form-select ${errors.checkInTime ? 'is-invalid' : ''}`}
                                                    value={checkInHour}
                                                    onChange={(e) => handleCheckInHourChange(Number(e.target.value))}
                                                >
                                                    {Array.from({ length: 24 }, (_, i) => (
                                                        <option key={i} value={i} disabled={i < 12 || i > 23}>
                                                            {i.toString().padStart(2, "0")}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="align-self-center">:</span>
                                                <select
                                                    className="form-select"
                                                    value={checkInMinute}
                                                    onChange={(e) => handleCheckInMinuteChange(Number(e.target.value))}
                                                >
                                                    {[0, 15, 30, 45].map((m) => (
                                                        <option key={m} value={m}>
                                                            {m.toString().padStart(2, "0")}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <small className="text-muted">Between 12:00 and 23:00</small>
                                            {errors.checkInTime && <div className="text-danger small">{errors.checkInTime}</div>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">Check-out time</label>
                                            <div className="d-flex gap-2" style={{ maxWidth: 200 }}>
                                                <select
                                                    className={`form-select ${errors.checkOutTime ? 'is-invalid' : ''}`}
                                                    value={checkOutHour}
                                                    onChange={(e) => handleCheckOutHourChange(Number(e.target.value))}
                                                >
                                                    {Array.from({ length: 24 }, (_, i) => (
                                                        <option key={i} value={i} disabled={i < 6 || i > 12}>
                                                            {i.toString().padStart(2, "0")}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="align-self-center">:</span>
                                                <select
                                                    className="form-select"
                                                    value={checkOutMinute}
                                                    onChange={(e) => handleCheckOutMinuteChange(Number(e.target.value))}
                                                >
                                                    {[0, 15, 30, 45].map((m) => (
                                                        <option key={m} value={m}>
                                                            {m.toString().padStart(2, "0")}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <small className="text-muted">Between 6:00 and 12:00</small>
                                            {errors.checkOutTime && <div className="text-danger small">{errors.checkOutTime}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <div className="card mb-3" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                                    <div className="card-body">
                                        <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                            📝 Description Tips
                                        </div>
                                        <ul className="mb-0 small" style={{ color: "#22614D" }}>
                                            <li>Highlight unique features</li>
                                            <li>Mention nearby attractions</li>
                                            <li>Be honest and accurate</li>
                                            <li>Use clear, engaging language</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="card" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                                    <div className="card-body">
                                        <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                            ⏰ Time Guidelines
                                        </div>
                                        <div className="small text-muted">
                                            Standard check-in: 14:00-16:00<br/>
                                            Standard check-out: 10:00-12:00<br/>
                                            Must have at least 1 hour gap between times.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-start mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={onBack}
                            >
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
                </div>
            </div>
        </div>
    );
}