import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getEstablishmentById, updateEstablishment } from "../../api/establishmentsApi";
import GeoPicker from "../../components/GeoPicker";
import {
  ESTABLISHMENT_TYPE_LABELS,
  ESTABLISHMENT_FEATURE_LABELS,
  normalizeFeaturesForCheckboxes,
  featuresObjectToBitmask,
} from '../../utils/enums';

const EditHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const [existingPhotos, setExistingPhotos] = useState([]); 
  const [newPhotos, setNewPhotos] = useState([]);
  const [position, setPosition] = useState([50.45, 30.52]);
  const [geolocation, setGeolocation] = useState(null);
  const [checkInHour, setCheckInHour] = useState(14);
  const [checkInMinute, setCheckInMinute] = useState(0);
  const [checkOutHour, setCheckOutHour] = useState(12);
  const [checkOutMinute, setCheckOutMinute] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [hotel, setHotel] = useState({
    name: "",
    description: "",
    type: 0, 
    features: {},
    checkInTime: { hour: 14, minute: 0 },
    checkOutTime: { hour: 12, minute: 0 },
    ownerId: user?.id || null,
  });

  const ESTABLISHMENT_TYPES = Object.entries(ESTABLISHMENT_TYPE_LABELS).map(([label, value]) => ({
    label,
    value
  }));

  const ESTABLISHMENT_FEATURES = Object.entries(ESTABLISHMENT_FEATURE_LABELS).map(([label, idx]) => ({
    label,
    value: 1 << idx
  }));

  const validateName = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return "Hotel name is required";
    if (trimmedName.length < 10) return "Hotel name must be at least 10 characters long";
    if (trimmedName.length > 100) return "Hotel name must not exceed 100 characters";
    return "";
  };

  const validateDescription = (description) => {
    const trimmedDesc = description.trim();
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

  const validatePhotos = (existingPhotos, newPhotos) => {
    const totalPhotos = existingPhotos.length + newPhotos.length;
    if (totalPhotos === 0) return "At least 1 photo is required";
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateName(hotel.name);
    if (nameError) newErrors.name = nameError;
    
    const descError = validateDescription(hotel.description);
    if (descError) newErrors.description = descError;
    
    const checkOutError = validateCheckOutTime(checkOutHour);
    if (checkOutError) newErrors.checkOutTime = checkOutError;
    
    const checkInError = validateCheckInTime(checkInHour);
    if (checkInError) newErrors.checkInTime = checkInError;
    
    if (!checkInError && !checkOutError) {
      const timeGapError = validateTimeGap(checkInHour, checkInMinute, checkOutHour, checkOutMinute);
      if (timeGapError) newErrors.timeGap = timeGapError;
    }
    
    if (!position || !position[0] || !position[1]) {
      newErrors.position = "Please select hotel location on the map";
    }

    const photosError = validatePhotos(existingPhotos, newPhotos);
    if (photosError) newErrors.photos = photosError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const data = await getEstablishmentById(id);
        
        setHotel({
          name: data.name || "",
          description: data.description || "",
          type: data.type ?? 0,
          features: normalizeFeaturesForCheckboxes(data.features, ESTABLISHMENT_FEATURE_LABELS),
          ownerId: data.ownerId || user?.id,
          createdAt: data.createdAt,
          rating: data.rating || null,
        });
        setCheckInHour(data.checkInTime?.slice(0,2) ?? 14);
        setCheckInMinute(data.checkInTime?.slice(3,5) ?? "00");
        setCheckOutHour(data.checkOutTime?.slice(0,2) ?? 12);
        setCheckOutMinute(data.checkOutTime?.slice(3,5) ?? "00");
        setExistingPhotos(data.photos || []);
        if (data.geolocation) {
          setGeolocation(data.geolocation);
          setPosition([data.geolocation.latitude, data.geolocation.longitude]);
        }
      } catch (error) {
        console.error("❌ Error loading hotel:", error);
        toast.error("Error loading hotel data");
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHotel((prev) => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const currentTotal = existingPhotos.length + newPhotos.length;
    
    if (currentTotal + files.length > maxFiles) {
      toast.error(`You can upload maximum ${maxFiles} photos total`);
      return;
    }

    files.forEach(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPhotos(prev => {
          const newPhotosList = [...prev, ev.target.result];
          if (errors.photos && newPhotosList.length > 0) {
            setErrors(prevErrors => ({ ...prevErrors, photos: '' }));
          }
          return newPhotosList;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeletePhoto = (idx, isExisting) => {
    if (isExisting) {
      const updatedExisting = existingPhotos.filter((_, i) => i !== idx);
      setExistingPhotos(updatedExisting);
      
      if (updatedExisting.length + newPhotos.length === 0) {
        setErrors(prev => ({ ...prev, photos: 'At least 1 photo is required' }));
      }
    } else {
      const updatedNew = newPhotos.filter((_, i) => i !== idx);
      setNewPhotos(updatedNew);
      
      if (existingPhotos.length + updatedNew.length === 0) {
        setErrors(prev => ({ ...prev, photos: 'At least 1 photo is required' }));
      }
    }
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
    } else {
      toast.error("Error updating hotel. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const existingPhotosIds = existingPhotos
        .map(p => p.id)
        .filter(id => typeof id === "number" && !isNaN(id));

      const featuresBitmask = featuresObjectToBitmask(hotel.features, ESTABLISHMENT_FEATURE_LABELS);

      const payload = {
        name: hotel.name.trim(),
        description: hotel.description.trim(),
        type: hotel.type,
        features: featuresBitmask,
        checkInTime: `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}:00`,
        checkOutTime: `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}:00`,
        ownerId: hotel.ownerId || user?.id,
        existingPhotosIds,
        newPhotosBase64: newPhotos,
        latitude: position[0],
        longitude: position[1],        
      };

      console.log("Submitting establishment payload:", payload);

      await updateEstablishment(id, payload);
      toast.success("Hotel updated successfully!");
      navigate("/landlordpanel");
    } catch (err) {
      console.error("❌ Update failed", err);
      handleBackendErrors(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <LoadingSpinner size="medium" text="Loading hotel data..." />
    </div>
  );

  const totalPhotos = existingPhotos.length + newPhotos.length;

  return (
    <div style={{
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
        alignItems: "flex-start",
        justifyContent: "center",
      }}>

      <div  
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          padding: "32px 36px 32px 36px",
          width: "100%",
          maxWidth: "98vw",
          boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
          marginTop: "100px",
        }}>

      <h3>✏️ Edit Hotel</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            name="name"
            style={{marginTop: 20}}
            placeholder="Name of the hotel"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={hotel.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <small className="text-muted ms-2">
            Hotel name must be 10-100 characters long ({hotel.name.trim().length}/100)
          </small>
          {errors.name && <div className="invalid-feedback ms-2">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <select
            className="form-select"
            name="type"
            value={hotel.type}
            onChange={e => setHotel({ ...hotel, type: Number(e.target.value) })}
            disabled={isSubmitting}
            required
          >
            {ESTABLISHMENT_TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <small className="text-muted ms-2">Select your object type.</small>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Location</label>
          {geolocation && (
            <div className="mb-2 p-2 bg-light rounded">
              <small>
                <strong>Country:</strong> {geolocation.country}<br/>
                <strong>City:</strong> {geolocation.city}<br/>
                <strong>Address:</strong> {geolocation.address ? geolocation.address.split(",").slice(0, 2).join(",") : ""}
              </small>
            </div>
          )}
          <GeoPicker value={position} onChange={setPosition} />
          {errors.position && <div className="text-danger small ms-2">{errors.position}</div>}
        </div>

        <div className="mb-3">
          <textarea
            name="description"
            placeholder="Brief description"
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            value={hotel.description}
            onChange={handleChange}
            rows={4}
            disabled={isSubmitting}
            required
          />
          <small className="text-muted ms-2">
            Description must be 50-200 characters long ({hotel.description.trim().length}/200)
          </small>
          {errors.description && <div className="invalid-feedback ms-2">{errors.description}</div>}
        </div>

        <div className="mb-4">
          {errors.timeGap && (
            <div className="alert alert-warning py-2 mb-3">
              {errors.timeGap}
            </div>
          )}
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Check-in time:</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  value={checkInHour}
                  onChange={e => handleCheckInHourChange(Number(e.target.value))}
                  className={`form-control ${errors.checkInTime ? 'is-invalid' : ''}`}
                  style={{ width: 70 }}
                  disabled={isSubmitting}
                  required
                />
                <span>:</span>
                <input
                  type="number"
                  value={checkInMinute}
                  onChange={e => handleCheckInMinuteChange(Number(e.target.value))}
                  className="form-control"
                  style={{ width: 70 }}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <small className="text-muted ms-2">Between 12:00 and 23:00</small>
              {errors.checkInTime && <div className="text-danger small ms-2">{errors.checkInTime}</div>}
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Check-out time:</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  value={checkOutHour}
                  onChange={e => handleCheckOutHourChange(Number(e.target.value))}
                  className={`form-control ${errors.checkOutTime ? 'is-invalid' : ''}`}
                  style={{ width: 70 }}
                  disabled={isSubmitting}
                  required
                />
                <span>:</span>
                <input
                  type="number"
                  value={checkOutMinute}
                  onChange={e => handleCheckOutMinuteChange(Number(e.target.value))}
                  className="form-control"
                  style={{ width: 70 }}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <small className="text-muted ms-2">Between 6:00 and 12:00</small>
              {errors.checkOutTime && <div className="text-danger small ms-2">{errors.checkOutTime}</div>}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Features:</label>
          <div className="row">
            {ESTABLISHMENT_FEATURES.map(opt => (
              <div key={opt.value} className="col-md-4 col-sm-6 mb-2">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`feature-${opt.value}`}
                    checked={!!hotel.features[opt.label]}
                    disabled={isSubmitting}
                    onChange={() =>
                      setHotel(prev => ({
                        ...prev,
                        features: { ...prev.features, [opt.label]: !prev.features[opt.label] }
                      }))
                    }
                  />
                  <label className="form-check-label" htmlFor={`feature-${opt.value}`}>
                    {opt.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">
            Photos <span className="text-danger">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            className={`form-control ${errors.photos ? 'is-invalid' : ''}`}
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
          <small className="text-muted ms-2">
            At least 1 photo is required. Upload up to 10 photos total, max 5MB each ({totalPhotos}/10)
          </small>
          {errors.photos && <div className="invalid-feedback ms-2">{errors.photos}</div>}
        </div>

        {totalPhotos > 0 && (
          <div className="mb-4">
            <div className="d-flex flex-wrap gap-2">
              {existingPhotos.map((p, idx) => (
                <div key={p.id || p.blobUrl || idx} className="position-relative">
                  <img 
                    src={p.blobUrl} 
                    alt={`Existing ${idx + 1}`} 
                    width={100} 
                    height={100} 
                    style={{ 
                      objectFit: "cover", 
                      borderRadius: 8, 
                      border: '2px solid #28a745' 
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
                    onClick={() => handleDeletePhoto(idx, true)}
                    disabled={isSubmitting}
                    aria-label="Remove existing photo"
                  >
                    ×
                  </button>
                  <small className="position-absolute bottom-0 start-0 bg-success text-white px-1 rounded">
                    Existing
                  </small>
                </div>
              ))}

              {newPhotos.map((p, idx) => (
                <div key={`new_${idx}`} className="position-relative">
                  <img 
                    src={p} 
                    alt={`New ${idx + 1}`} 
                    width={100} 
                    height={100} 
                    style={{ 
                      objectFit: "cover", 
                      borderRadius: 8, 
                      border: '2px solid #007bff' 
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
                    onClick={() => handleDeletePhoto(idx, false)}
                    disabled={isSubmitting}
                    aria-label="Remove new photo"
                  >
                    ×
                  </button>
                  <small className="position-absolute bottom-0 start-0 bg-primary text-white px-1 rounded">
                    New
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default EditHotel;