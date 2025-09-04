import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import WizardProgress from "./WizardProgress";

export default function Step5Photos() {
    const navigate = useNavigate();
    const {
        photoFiles = [],
        setPhotoFiles,
        photoPreviews = [],
        setPhotoPreviews,
        setStep,
        name,
        setName,
    } = useEstWizard();

    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (setName && !name) {
            setStep(1);
            navigate("/add-establishment/step-1");
        }
    }, [setName, name, setStep, navigate]);

    const validatePhotos = (photoFiles) => {
        if (!photoFiles || photoFiles.length === 0) return "At least 1 photo is required";
        if (photoFiles.length < 5) return "At least 5 photos are required for better visibility";
        if (photoFiles.length > 15) return "Maximum 15 photos allowed";
        return "";
    };

    const validateFileSize = (file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return `File ${file.name} is too large. Maximum size is 5MB`;
        }
        return "";
    };

    const validateFileType = (file) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return `File ${file.name} has unsupported format. Use JPG, PNG, or WebP`;
        }
        return "";
    };

    const validateForm = () => {
        const newErrors = {};
        
        const photosError = validatePhotos(photoFiles);
        if (photosError) newErrors.photos = photosError;
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFiles = useCallback((fileList) => {
        const files = Array.from(fileList || []);
        if (!files.length) return;

        setIsUploading(true);

        const currentTotal = photoFiles.length;
        const maxFiles = 15;
        
        if (currentTotal + files.length > maxFiles) {
            toast.error(`You can upload maximum ${maxFiles} photos. Currently have ${currentTotal}, trying to add ${files.length}`);
            setIsUploading(false);
            return;
        }

        const validFiles = [];
        const invalidFiles = [];

        files.forEach(file => {
            const sizeError = validateFileSize(file);
            const typeError = validateFileType(file);
            
            if (sizeError) {
                toast.error(sizeError);
                invalidFiles.push(file);
            } else if (typeError) {
                toast.error(typeError);
                invalidFiles.push(file);
            } else {
                validFiles.push(file);
            }
        });

        if (validFiles.length === 0) {
            setIsUploading(false);
            return;
        }

        setPhotoFiles(prev => [...prev, ...validFiles]);
        const urls = validFiles.map(f => URL.createObjectURL(f));
        setPhotoPreviews(prev => [...prev, ...urls]);

        if (errors.photos && validFiles.length > 0) {
            setErrors(prev => ({ ...prev, photos: '' }));
        }

        if (validFiles.length > 0) {
            toast.success(`${validFiles.length} photo(s) uploaded successfully`);
        }

        try {
            const meta = [...photoFiles, ...validFiles].map(f => ({ 
                name: f.name, 
                size: f.size, 
                type: f.type 
            }));
            localStorage.setItem("estWizard_photos_meta", JSON.stringify(meta));
        } catch (e) {
            console.warn("Could not save photo metadata to localStorage:", e);
        }

        setIsUploading(false);
    }, [photoFiles, setPhotoFiles, setPhotoPreviews, errors.photos]);

    const onInputChange = (e) => handleFiles(e.target.files);

    const onDrop = (e) => { 
        e.preventDefault(); 
        handleFiles(e.dataTransfer.files); 
    };
    
    const onDragOver = (e) => e.preventDefault();

    const removeAt = (idx) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== idx));
        setPhotoPreviews(prev => {
            const toRevoke = prev[idx];
            if (toRevoke) {
                try {
                    URL.revokeObjectURL(toRevoke);
                } catch (e) {
                    console.warn("Could not revoke URL:", e);
                }
            }
            return prev.filter((_, i) => i !== idx);
        });

        const remainingCount = photoFiles.length - 1;
        if (remainingCount === 0) {
            setErrors(prev => ({ ...prev, photos: 'At least 1 photo is required' }));
        } else if (remainingCount < 5) {
            setErrors(prev => ({ ...prev, photos: 'At least 5 photos are recommended for better visibility' }));
        }
    };

    useEffect(() => {
        return () => {
            (photoPreviews || []).forEach(u => { 
                try { 
                    URL.revokeObjectURL(u); 
                } catch (e) {
                    console.warn("Could not revoke URL:", e);
                }
            });
        };
    }, [photoPreviews]);

    const onBack = () => { 
        setStep(4); 
        navigate("/add-establishment/step-4"); 
    };

    const onNext = () => {
        if (!validateForm()) {
            toast.error("Please upload the required photos before proceeding");
            return;
        }
        
        setStep(6);
        navigate("/add-establishment/step-6");
    };

    const photoCount = photoFiles?.length ?? 0;
    const isMinimumMet = photoCount >= 1;
    const isRecommendedMet = photoCount >= 5;

    return (
        <div style={{ position: "relative", minHeight: "100vh", zIndex: 2, paddingBottom: 40, marginTop: -110 }}>
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
                    <WizardProgress current={5} />
                    
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
                        <div className="row g-4">
                            <h3 className="mb-3" style={{ color: "#FA7E1E" }}>
                                How does your property look?
                            </h3>
                            
                            <div className="col-12 col-md-7">
                                <div className="mb-3 d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                        Photos uploaded: {photoCount}/15
                                        {isMinimumMet ? (
                                            isRecommendedMet ? (
                                                <span className="text-success ms-2">✓ Recommended amount</span>
                                            ) : (
                                                <span className="text-warning ms-2">⚠ Consider adding more photos</span>
                                            )
                                        ) : (
                                            <span className="text-danger ms-2">✗ At least 1 photo required</span>
                                        )}
                                    </small>
                                </div>

                                <div
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    className={`d-flex flex-column align-items-center justify-content-center mb-3 ${errors.photos ? 'border-danger' : ''}`}
                                    style={{
                                        border: `2px dashed ${errors.photos ? '#dc3545' : '#cfe3ef'}`,
                                        borderRadius: 12,
                                        minHeight: 220,
                                        padding: 20,
                                        background: errors.photos ? '#fff5f5' : '#f8fbfd',
                                        cursor: isUploading ? 'wait' : 'pointer'
                                    }}
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="spinner-border text-primary mb-2" role="status">
                                                <span className="visually-hidden">Uploading...</span>
                                            </div>
                                            <div>Processing photos...</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="mb-2">📸 Drag photos here or</div>
                                            <label className="btn btn-outline-primary" style={{ cursor: 'pointer' }}>
                                                Upload photos
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    multiple
                                                    hidden
                                                    onChange={onInputChange}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                            <div className="text-muted small mt-2 text-center">
                                                Supported: JPG, PNG, WebP<br/>
                                                Max size: 5MB per file<br/>
                                                Maximum: 15 photos
                                            </div>
                                        </>
                                    )}
                                </div>

                                {errors.photos && (
                                    <div className="text-danger small mb-3">
                                        {errors.photos}
                                    </div>
                                )}

                                {(photoPreviews?.length ?? 0) > 0 && (
                                    <div className="d-flex flex-wrap gap-2">
                                        {photoPreviews.map((src, idx) => (
                                            <div key={idx} className="position-relative" style={{ width: 110, height: 110 }}>
                                                <img 
                                                    src={src} 
                                                    alt={`Photo ${idx + 1}`} 
                                                    style={{ 
                                                        width:"100%", 
                                                        height:"100%", 
                                                        objectFit:"cover", 
                                                        borderRadius:8, 
                                                        border:"2px solid #e9ecef" 
                                                    }} 
                                                />
                                                <button 
                                                    type="button" 
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle" 
                                                    style={{ 
                                                        width: 24, 
                                                        height: 24, 
                                                        padding: 0,
                                                        transform: 'translate(8px, -8px)'
                                                    }}
                                                    onClick={() => removeAt(idx)}
                                                    disabled={isUploading}
                                                    aria-label={`Remove photo ${idx + 1}`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="col-12 col-md-5">                               
                                <div className="card mb-3" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                                    <div className="card-body">
                                        <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                            📋 Photo Requirements
                                        </div>
                                        <ul className="mb-0 small" style={{ color: "#22614D" }}>
                                            <li><strong>Minimum:</strong> 1 photo (required)</li>
                                            <li><strong>Recommended:</strong> 5+ photos</li>
                                            <li><strong>Maximum:</strong> 15 photos</li>
                                            <li><strong>Size:</strong> Up to 5MB each</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="card" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                                    <div className="card-body">
                                        <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                            💡 Best Practices
                                        </div>
                                        <ul className="mb-0 small" style={{ color: "#22614D" }}>
                                            <li>Include exterior and interior shots</li>
                                            <li>One photo per room + common areas</li>
                                            <li>Mix of vertical and horizontal frames</li>
                                            <li>Good lighting and clean spaces</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-start mt-4">
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary" 
                                onClick={onBack}
                                disabled={isUploading}
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ marginLeft: 10, minWidth: 500 }}
                                onClick={onNext}
                                disabled={isUploading || !isMinimumMet}
                            >
                                {isUploading ? "Processing..." : "Next →"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}