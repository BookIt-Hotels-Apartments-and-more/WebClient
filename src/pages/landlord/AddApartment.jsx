import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  // Фото
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    ).then((base64s) => setNewPhotos((prev) => [...prev, ...base64s]));
  };

  // Features
  const handleFeatureChange = (flag) => {
    setApartment((ap) => ({
      ...ap,
      features: ap.features ^ flag,
    }));
  };

  const handleChange = (e) => {
    setApartment({ ...apartment, [e.target.name]: e.target.value });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...apartment,
        price: Number(apartment.price),
        area: Number(apartment.area),
        capacity: Number(apartment.capacity),
        establishmentId: establishmentId ? Number(establishmentId) : undefined,
        existingPhotosIds: [],
        newPhotosBase64: newPhotos,
      };
      await createApartment(payload);
      navigate("/landlordpanel");
    } catch (error) {
      alert("❌ Error adding apartment");
      console.error(error);
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
          paddingBottom: 20,
          background:
            "linear-gradient(180deg, rgba(3,173,179,0.18) 0%, rgba(214,231,238,1) 30%, rgba(214,231,238,0) 50%)",
        }}
      >
        <div className="container mt-4" >
          <h3 style={{marginTop: 120,}}>➕ Add Apartment</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Name</label>
              <input name="name" value={apartment.name} onChange={handleChange} className="form-control" required />
            </div>
            <p style={{fontSize: 10}}>* The name must be between 10 and 100 characters.</p>
            <div className="mb-3">
              <label>Price</label>
              <input name="price" type="number" value={apartment.price} onChange={handleChange} className="form-control" required />
            </div>
            <div className="mb-3">
              <label>Area (м²)</label>
              <input name="area" type="number" value={apartment.area} onChange={handleChange} className="form-control" min={1} required />
            </div>
            <div className="mb-3">
              <label>Capacity</label>
              <input name="capacity" type="number" value={apartment.capacity} onChange={handleChange} className="form-control" min={1} required />
            </div>
            <div className="mb-3">
              <label>Description</label>
              <textarea name="description" value={apartment.description} onChange={handleChange} className="form-control" required />
            </div>
            <p style={{fontSize: 10}}>* Description must be between 50 and 2000 characters.</p>
            <div className="mb-3">
              <label>Features</label>
              <div className="d-flex flex-wrap gap-3 mt-1">
                {Object.keys(APARTMENT_FEATURE_LABELS).map(key => {
                  const flag = 1 << APARTMENT_FEATURE_LABELS[key];
                  return (
                    <label key={key} style={{ fontWeight: 400, marginRight: 16 }}>
                      <input
                        type="checkbox"
                        style={{marginRight: 6}}
                        checked={(apartment.features & flag) !== 0}
                        onChange={() => handleFeatureChange(flag)}
                      /> {key}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="mb-3">
              <label>Photos</label>
              <input type="file" accept="image/*" multiple className="form-control" onChange={handleFileChange} />
              <div className="d-flex flex-wrap gap-2 mt-2">
                {newPhotos.map((img, idx) => (
                  <img key={idx} src={img} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }} />
                ))}
              </div>
            </div>
            <button className="btn btn-success" disabled={loading}>Add Apartment</button>
            <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>Cancel</button>
          </form>
      </div>

      </div>
      

    </div>
    
  );
};

export default AddApartment;
