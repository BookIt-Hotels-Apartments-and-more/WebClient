import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import { ESTABLISHMENT_TYPE_LABELS } from "../../utils/enums";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import WizardProgress from "./WizardProgress";

export default function Step1Name() {
    const navigate = useNavigate();
    const { name, setName, setStep, propertyType, setPropertyType } = useEstWizard();
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (setName && !name) {
            setStep(1);
            navigate("/add-establishment/step-1");
        }
    }, [setName, name, setStep, navigate]);

    const validateName = (name) => {
        const trimmedName = name.trim();
        if (!trimmedName) return "Property name is required";
        if (trimmedName.length < 10) return "Property name must be at least 10 characters long";
        if (trimmedName.length > 100) return "Property name must not exceed 100 characters";
        return "";
    };

    const validatePropertyType = (propertyType) => {
        if (!Number.isInteger(propertyType)) return "Please select a property type";
        return "";
    };

    const validateForm = () => {
        const newErrors = {};
        
        const nameError = validateName(name);
        if (nameError) newErrors.name = nameError;
        
        const typeError = validatePropertyType(propertyType);
        if (typeError) newErrors.propertyType = typeError;
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleTypeChange = (e) => {
        const v = e.target.value;
        const typeValue = v === "" ? null : Number(v);
        setPropertyType(typeValue);
        
        if (errors.propertyType) {
            setErrors(prev => ({ ...prev, propertyType: '' }));
        }
    };

    const onNext = () => {
        if (!validateForm()) {
            toast.error("Please fix all validation errors before proceeding");
            return;
        }
        
        setStep(2);
        navigate("/add-establishment/step-2");
    };

    const onBack = () => {
        navigate(-1);
    };

    const TYPE_OPTIONS = Object.entries(ESTABLISHMENT_TYPE_LABELS).map(([key, value]) => ({
        value,
        label: key,
    }));

    return (
        <div style={{ position: "relative", minHeight: "100vh", zIndex: 2, paddingBottom: 40, marginTop: -110}}>
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
                    <WizardProgress current={1} /> 
                    <div
                        style={{
                            background: "rgba(255,255,255,0.95)",
                            borderRadius: 16,
                            padding: 24,
                            width: "100%",
                            maxWidth: 1100,
                            boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
                            marginTop: 100,
                        }}
                    >
                        <div className="row g-4">
                            <h3 className="mb-3" style={{ color: "#FA7E1E" }}>
                                How is your property called?
                            </h3>
                            
                            <div className="col-12 col-md-7">
                                <div className="mb-3">
                                    <select
                                        className={`form-select ${errors.propertyType ? 'is-invalid' : ''}`}
                                        value={Number.isInteger(propertyType) ? String(propertyType) : ""}
                                        onChange={handleTypeChange}
                                    >
                                        <option value="" disabled>
                                            Select property type
                                        </option>
                                        {TYPE_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.propertyType && <div className="invalid-feedback ms-2">{errors.propertyType}</div>}
                                </div>

                                <input
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    placeholder="Enter property name"
                                    value={name}
                                    onChange={handleNameChange}
                                />
                                <small className="text-muted  ms-2">
                                    Property name must be 10-100 characters long ({name.trim().length}/100)
                                </small>
                                {errors.name && <div className="invalid-feedback ms-2">{errors.name}</div>}
                            </div>

                            <div className="col-12 col-md-5">
                                <div className="card mb-3" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                                    <div className="card-body">
                                        <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                            What should be considered when choosing a name?
                                        </div>
                                        <ul className="mb-0 small" style={{ color: "#22614D" }}>
                                            <li>A short, easy-to-remember name</li>
                                            <li>Avoid abbreviations</li>
                                            <li>Be objective.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="card" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                                    <div className="card-body">
                                        <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                            Why the name at all?
                                        </div>
                                        <div className="small text-muted">
                                            It appears in headlines and helps guests understand what you offer.
                                            Do not include the address in the title.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-flex-start mt-4">
                            <button className="btn btn-outline-secondary" onClick={onBack}>
                                ← Back
                            </button>
                            <button className="btn btn-primary" style={{ marginLeft: 10, minWidth: 500 }} onClick={onNext}>
                                Next
                            </button>
                        </div>
                    </div>
                </div>                         
            </div>      
        </div>
    );
}