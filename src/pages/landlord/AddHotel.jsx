import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { createEstablishment } from "../../api/establishmentsApi";
import GeoPicker from "../../components/GeoPicker"; 
import {
  ESTABLISHMENT_TYPE_LABELS,
  ESTABLISHMENT_FEATURE_LABELS
} from '../../utils/enums';

const AddHotel = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user); 
  const [checkInHour, setCheckInHour] = useState(14);
  const [checkInMinute, setCheckInMinute] = useState(0);
  const [checkOutHour, setCheckOutHour] = useState(12);
  const [checkOutMinute, setCheckOutMinute] = useState(0);

  const [hotel, setHotel] = useState({
    name: "",
    description: "",
    type: 0, 
    features: 0, 
    checkInTime: { hour: 14, minute: 0 },
    checkOutTime: { hour: 12, minute: 0 },
  });
  const ESTABLISHMENT_TYPES = Object.entries(ESTABLISHMENT_TYPE_LABELS).map(([label, value]) => ({
    label,
    value
  }));

  const ESTABLISHMENT_FEATURES = Object.entries(ESTABLISHMENT_FEATURE_LABELS).map(([label, idx]) => ({
    label,
    value: 1 << idx
  }));

  const [photos, setPhotos] = useState([]);
  const [position, setPosition] = useState([50.45, 30.52]); 

  const handleChange = (e) => {
    setHotel({ ...hotel, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeletePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert("Користувач не авторизований");
      return;
    }
    if (!position || !position[0] || !position[1]) {
      alert("Будь ласка, виберіть розташування готелю на мапі.");
      return;
    }
    try {
      const payload = {
        name: hotel.name,
        description: hotel.description,
        type: hotel.type,
        features: hotel.features,
        checkInTime: `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}:00`,
        checkOutTime: `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}:00`,
        latitude: position[0],
        longitude: position[1],
        ownerId: user.id,
        existingPhotosIds: [],
        newPhotosBase64: photos
      };



      console.log("Submitting establishment payload:", payload);
      await createEstablishment(payload);
      navigate("/landlordpanel");
    } catch (err) {
      console.error("❌ Error adding hotel:", err);
    }
  };

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

      <h3>➕ Add a new hotel</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          style={{marginTop: 20}}
          placeholder="Name of the hotel"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />

        {/* Тип */}
        <select
          className="form-select mb-2"
          style={{marginTop: 20}}
          name="type"
          value={hotel.type}
          onChange={e => setHotel({ ...hotel, type: Number(e.target.value) })}
          required
        >
          {ESTABLISHMENT_TYPES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p style={{fontSize: 12}}>* Select your object type.</p>


        {/* Геопозиція */}
        <GeoPicker value={position} onChange={setPosition} />
          {/* Опис */}
        <textarea
          name="description"
          style={{marginTop: 20}}
          placeholder="Brief description"
          className="form-control mb-3"
          onChange={handleChange}
          required
        />
        <p style={{fontSize: 12}}>* The description must be at least 50 characters long.</p>
          {/* Час заїзду та виїзду */}
        <div className="mb-2 row" style={{marginTop: 40}}>
          <div className="col-auto">
            <label style={{ fontWeight: 500 }}>Check-in time:</label>
            <div className="d-flex align-items-center">
              <input
                type="number"
                min={0}
                max={23}
                value={checkInHour}
                onChange={e => setCheckInHour(Number(e.target.value))}
                className="form-control"
                style={{ width: 60 }}
                required
              />
              <span className="mx-1">:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={checkInMinute}
                onChange={e => setCheckInMinute(Number(e.target.value))}
                className="form-control"
                style={{ width: 60 }}
                required
              />
            </div>
          </div>
          <div className="col-auto">
            <label style={{ fontWeight: 500 }}>Check-out time:</label>
            <div className="d-flex align-items-center">
              <input
                type="number"
                min={0}
                max={23}
                value={checkOutHour}
                onChange={e => setCheckOutHour(Number(e.target.value))}
                className="form-control"
                style={{ width: 60 }}
                required
              />
              <span className="mx-1">:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={checkOutMinute}
                onChange={e => setCheckOutMinute(Number(e.target.value))}
                className="form-control"
                style={{ width: 60 }}
                required
              />
            </div>
          </div>
        </div>


          {/* Удобства */}
        <div className="mb-2">
          <label style={{ fontWeight: 500, marginTop: 20 }}>Features:</label>
          <div className="d-flex flex-wrap gap-2">
            {ESTABLISHMENT_FEATURES.map(opt => (
              <label key={opt.value} className="d-flex align-items-center" style={{ minWidth: 160 }}>
                <input
                  type="checkbox"
                  checked={(hotel.features & opt.value) !== 0}
                  onChange={e => {
                    setHotel(hotel => ({
                      ...hotel,
                      features: e.target.checked
                        ? hotel.features | opt.value
                        : hotel.features & ~opt.value
                    }));
                  }}
                />
                <span className="ms-2">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

            {/* Фото */}
        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          className="form-control mb-3"
          style={{marginTop: 20}}
          onChange={handleFileChange}
        />

        <div className="mb-3 d-flex flex-wrap">
          {photos.map((p, idx) => (
            <div key={idx} className="me-2 mb-2 position-relative">
              <img src={p} alt="preview" width={80} height={80} style={{ objectFit: "cover", borderRadius: 8, border: '1px solid #eee' }} />
              <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" style={{zIndex:1}} onClick={() => handleDeletePhoto(idx)}>×</button>
            </div>
          ))}
        </div>

        <button className="btn btn-primary">Add a hotel</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </form>
    </div>

    </div>
    
  );
};

export default AddHotel;
