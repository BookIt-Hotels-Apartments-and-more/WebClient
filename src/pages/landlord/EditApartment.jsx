import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApartmentById, updateApartment } from "../../api/apartmentApi";
import { APARTMENT_FEATURE_LABELS, normalizeFeaturesForCheckboxes } from "../../utils/enums";

const EditApartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [existingPhotos, setExistingPhotos] = useState([]); 
  const [newPhotos, setNewPhotos] = useState([]);

  const [apartment, setApartment] = useState({
      name: "",
      price: 0,
      area: 0,
      capacity: 1,
      description: "",
      features: normalizeFeaturesForCheckboxes(data.features, APARTMENT_FEATURE_LABELS),
      establishmentId: 0,
    });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const data = await getApartmentById(id);
        setApartment({
          name: data.name || "",
          price: data.price || 0,
          area: data.area || 0,
          capacity: data.capacity || 1,
          description: data.description || "",
          features: data.features || {},
          establishmentId: data.establishment?.id || 0,
        });
        setExistingPhotos(data.photos || []);
      } catch (error) {
        console.error("❌ Error loading apartment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApartment();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setApartment((prev) => ({
      ...prev,
      [name]: name === "price" ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPhotos(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeletePhoto = (idx, isExisting) => {
    if (isExisting) {
      setExistingPhotos(prev => prev.filter((_, i) => i !== idx));
    } else {
      setNewPhotos(prev => prev.filter((_, i) => i !== idx));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const existingPhotosIds = existingPhotos.map(p => p.id);

      const payload = {
        ...apartment,
        existingPhotosIds,
        newPhotosBase64: newPhotos,
      };

      await updateApartment(id, payload);
      navigate("/landlordpanel");
    } catch (error) {
      console.error("❌ Error updating apartment:", error);
    }
  };


  if (loading) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h3>✏️ Edit apartment</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name apartment</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={apartment.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Area</label>
          <input
            type="number"
            name="area"
            className="form-control"
            value={apartment.area}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            name="price"
            className="form-control"
            value={apartment.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Features</label>
          <div className="d-flex flex-wrap gap-3 mt-1">
            {Object.keys(APARTMENT_FEATURE_LABELS).map(key => (
              <label key={key} style={{ fontWeight: 400, marginRight: 16 }}>
                <input
                  type="checkbox"
                  checked={!!apartment.features[key]}
                  onChange={() =>
                    setApartment(ap => ({
                      ...ap,
                      features: { ...ap.features, [key]: !ap.features[key] }
                    }))
                  }
                /> {key}
              </label>
            ))}

          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          className="form-control mb-3"
          onChange={handleFileChange}
        />

        <div className="mb-3 d-flex flex-wrap">
          {existingPhotos.map((p, idx) => (
            <div key={p.id} className="me-2 mb-2 position-relative">
              <img src={p.blobUrl} alt="apartment" width={80} height={80} style={{ objectFit: "cover", borderRadius: 8, border: '1px solid #eee' }} />
              <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" style={{zIndex:1}} onClick={() => handleDeletePhoto(idx, true)}>×</button>
            </div>
          ))}
          {newPhotos.map((p, idx) => (
            <div key={`new_${idx}`} className="me-2 mb-2 position-relative">
              <img src={p} alt="new apartment" width={80} height={80} style={{ objectFit: "cover", borderRadius: 8, border: '1px solid #eee' }} />
              <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" style={{zIndex:1}} onClick={() => handleDeletePhoto(idx, false)}>×</button>
            </div>
          ))}
        </div>

        <button className="btn btn-success">Save</button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </form>
    </div>
  );
};

export default EditApartment;
