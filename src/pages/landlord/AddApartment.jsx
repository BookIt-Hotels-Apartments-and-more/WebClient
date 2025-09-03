import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { createApartment } from "../../api/apartmentApi";
import { APARTMENT_FEATURE_LABELS } from "../../utils/enums";

const AddApartment = () => {
  const { establishmentId } = useParams();
  const navigate = useNavigate();

  const [apartment, setApartment] = useState({
    name: "",
    price: "",
    area: "",
    capacity: "",
    description: "",
    features: 0,
    photos: []
  });
  const [newPhotos, setNewPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateName = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return "Apartment name is required";
    if (trimmedName.length < 10) return "Name must be at least 10 characters long";
    if (trimmedName.length > 100) return "Name must not exceed 100 characters";
    return "";
  };

  const validateDescription = (description) => {
    const trimmedDesc = description.trim();
    if (!trimmedDesc) return "Description is required";
    if (trimmedDesc.length < 50) return "Description must be at least 50 characters long";
    if (trimmedDesc.length > 200) return "Description must not exceed 200 characters";
    return "";
  };

  const validateCapacity = (capacity) => {
    const num = Number(capacity);
    if (!capacity || isNaN(num)) return "Capacity is required";
    if (num < 1) return "Capacity must be at least 1 person";
    if (num > 50) return "Capacity cannot exceed 50 people";
    return "";
  };

  const validateArea = (area) => {
    const num = Number(area);
    if (!area || isNaN(num)) return "Area is required";
    if (num < 1) return "Area must be at least 1 m²";
    if (num > 10000) return "Area cannot exceed 10,000 m²";
    return "";
  };

  const validatePrice = (price) => {
    const num = Number(price);
    if (!price || isNaN(num)) return "Price is required";
    if (num <= 0) return "Price must be greater than 0";
    return "";
  };

  const validatePhotos = (photos) => {
    if (!photos || photos.length === 0) return "At least 1 photo is required";
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateName(apartment.name);
    if (nameError) newErrors.name = nameError;
    
    const descError = validateDescription(apartment.description);
    if (descError) newErrors.description = descError;
    
    const capacityError = validateCapacity(apartment.capacity);
    if (capacityError) newErrors.capacity = capacityError;
    
    const areaError = validateArea(apartment.area);
    if (areaError) newErrors.area = areaError;
    
    const priceError = validatePrice(apartment.price);
    if (priceError) newErrors.price = priceError;

    const photosError = validatePhotos(newPhotos);
    if (photosError) newErrors.photos = photosError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 15;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (newPhotos.length + files.length > maxFiles) {
      toast.error(`You can upload maximum ${maxFiles} photos`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    Promise.all(
      validFiles.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    ).then((base64s) => {
      setNewPhotos((prev) => [...prev, ...base64s]);
      if (errors.photos && base64s.length > 0) {
        setErrors(prev => ({ ...prev, photos: '' }));
      }
    });
  };

  const handleDeletePhoto = (idx) => {
    const updatedPhotos = newPhotos.filter((_, i) => i !== idx);
    setNewPhotos(updatedPhotos);
    
    if (updatedPhotos.length === 0) {
      setErrors(prev => ({ ...prev, photos: 'At least 1 photo is required' }));
    }
  };

  const handleFeatureChange = (flag) => {
    setApartment((ap) => ({
      ...ap,
      features: ap.features ^ flag,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApartment({ ...apartment, [name]: value });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
      toast.error("Error creating apartment. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        name: apartment.name.trim(),
        description: apartment.description.trim(),
        price: Number(apartment.price),
        area: Number(apartment.area),
        capacity: Number(apartment.capacity),
        features: apartment.features,
        establishmentId: establishmentId ? Number(establishmentId) : undefined,
        existingPhotosIds: [],
        newPhotosBase64: newPhotos,
      };
      
      console.log("Submitting apartment payload:", payload);      
      await createApartment(payload);
      toast.success("Apartment created successfully!");
      navigate("/landlordpanel");
    } catch (error) {
      console.error("❌ Error adding apartment:", error);
      handleBackendErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", zIndex: 2, paddingBottom: 40, marginTop: -110 }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          paddingTop: 32,
          paddingBottom: 40,
          background:
            "linear-gradient(180deg, rgba(3,173,179,0.18) 0%, rgba(214,231,238,1) 30%, rgba(214,231,238,0) 50%)",
        }}
      >
        <div className="container mt-4">
          <div 
            style={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: 16,
              padding: "32px 36px",
              boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
              marginTop: 120,
            }}
          >
            <h3 className="mb-4">➕ Add Apartment</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Name</label>
                <input 
                  name="name" 
                  value={apartment.name} 
                  onChange={handleChange} 
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Enter apartment name"
                  disabled={loading}
                  required 
                />
                <small className="text-muted ms-2">
                  Name must be 10-100 characters long ({apartment.name.trim().length}/100)
                </small>
                {errors.name && <div className="invalid-feedback ms-2">{errors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Price per night ($)</label>
                <input 
                  name="price" 
                  type="number" 
                  step="0.01"
                  value={apartment.price} 
                  onChange={handleChange} 
                  className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                  placeholder="Enter price per night"
                  disabled={loading}
                  required 
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Area (m²)</label>
                  <input 
                    name="area" 
                    type="number" 
                    value={apartment.area} 
                    onChange={handleChange} 
                    className={`form-control ${errors.area ? 'is-invalid' : ''}`}
                    placeholder="Enter area in m²"
                    disabled={loading}
                    required 
                  />
                  <small className="text-muted ms-2">Area must be 1-10,000 m²</small>
                  {errors.area && <div className="invalid-feedback ms-2">{errors.area}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Capacity (guests)</label>
                  <input 
                    name="capacity" 
                    type="number" 
                    value={apartment.capacity} 
                    onChange={handleChange} 
                    className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
                    placeholder="Maximum number of guests"
                    disabled={loading}
                    required 
                  />
                  <small className="text-muted ms-2">Capacity must be 1-50 people</small>
                  {errors.capacity && <div className="invalid-feedback ms-2">{errors.capacity}</div>}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Description</label>
                <textarea 
                  name="description" 
                  value={apartment.description} 
                  onChange={handleChange} 
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  rows={4}
                  placeholder="Describe your apartment..."
                  disabled={loading}
                  required 
                />
                <small className="text-muted ms-2">
                  Description must be 50-200 characters long ({apartment.description.trim().length}/200)
                </small>
                {errors.description && <div className="invalid-feedback ms-2">{errors.description}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Features & Amenities</label>
                <div className="row mt-2">
                  {Object.keys(APARTMENT_FEATURE_LABELS).map(key => {
                    const flag = 1 << APARTMENT_FEATURE_LABELS[key];
                    return (
                      <div key={key} className="col-md-4 col-sm-6 mb-2">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`feature-${key}`}
                            checked={(apartment.features & flag) !== 0}
                            onChange={() => handleFeatureChange(flag)}
                            disabled={loading}
                          />
                          <label className="form-check-label" htmlFor={`feature-${key}`}>
                            {key}
                          </label>
                        </div>
                      </div>
                    );
                  })}
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
                  disabled={loading}
                />
                <small className="text-muted ms-2">
                  At least 1 photo is required. Upload up to 15 photos, max 5MB each ({newPhotos.length}/15)
                </small>
                {errors.photos && <div className="invalid-feedback ms-2">{errors.photos}</div>}
                
                {newPhotos.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    {newPhotos.map((img, idx) => (
                      <div key={idx} className="position-relative">
                        <img 
                          src={img} 
                          alt={`Preview ${idx + 1}`} 
                          style={{ 
                            width: 100, 
                            height: 100, 
                            objectFit: "cover", 
                            borderRadius: 8,
                            border: '2px solid #e9ecef'
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
                          onClick={() => handleDeletePhoto(idx)}
                          disabled={loading}
                          aria-label="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : (
                    "Add Apartment"
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddApartment;