import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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

  useEffect(() => {
    getEstablishmentById(id)
      .then((data) => {
        
        setHotel({
          name: data.name || "",
          description: data.description || "",
          type: data.type ?? 0,
          features: normalizeFeaturesForCheckboxes(
          data.features,
          ESTABLISHMENT_FEATURE_LABELS
        ),
          ownerId: data.ownerId || user?.id,
          createdAt: data.createdAt,
          rating: data.rating || null,
        });
        setCheckInHour(data.checkInTime?.hour ?? 14);
        setCheckInMinute(data.checkInTime?.minute ?? 0);
        setCheckOutHour(data.checkOutTime?.hour ?? 12);
        setCheckOutMinute(data.checkOutTime?.minute ?? 0);
        setExistingPhotos(data.photos || []);
        if (data.geolocation) {
          setGeolocation(data.geolocation);
          setPosition([data.geolocation.latitude, data.geolocation.longitude]);
        }
      })
      .catch(console.error);
  }, [id]);

  const handleChange = (e) => {
    setHotel((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
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
      const existingPhotosIds = existingPhotos
        .map(p => p.id)
        .filter(id => typeof id === "number" && !isNaN(id));

      const featuresBitmask = featuresObjectToBitmask(
        hotel.features,
        ESTABLISHMENT_FEATURE_LABELS
      );

      const payload = {
        name: hotel.name,
        description: hotel.description,
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
      if (!position || !position[0] || !position[1]) {
        alert("Please select a location on the map.");
        return;
      }

      console.log("Submitting establishment payload:", payload);

      await updateEstablishment(id, payload);
      navigate("/landlordpanel");
    } catch (err) {
      console.error("❌ Update failed", err);
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
        <div className="container mt-4">
      <h3 style={{marginTop: 120}}>✏️ Edit Hotel</h3>
      <div style={{marginTop: 40}}>
        <b style={{fontWeight: 200}}>Name Hotel:</b>
      </div>
      <form onSubmit={handleSubmit}>
        <input name="name" style={{marginTop: 10}} value={hotel.name} onChange={handleChange} className="form-control mb-2" />

      {/* Тип нерухомості */}
      
        <div style={{marginTop: 20,}}>
          <b style={{fontWeight: 200}}>Type :</b>
        </div>           
        <select
            className="form-select mb-2"
            name="type"
            style={{marginTop: 10,}}
            value={hotel.type}
            onChange={e => setHotel({ ...hotel, type: Number(e.target.value) })}
            required
          >
            {ESTABLISHMENT_TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          
      {/* Геолокація */}
       {geolocation && (
        <div className="mb-2">
          <div>
            <b style={{fontWeight: 200, fontSize: 13}}>Country:</b> {geolocation.country}
          </div>
          <div>
            <b style={{fontWeight: 200, fontSize: 13}}>City:</b> {geolocation.city}
          </div>
          <div>
            <b style={{fontWeight: 200, fontSize: 13}}>Address:</b>{" "}
            {geolocation.address
              ? geolocation.address.split(",").slice(0, 2).join(",")
              : ""}
          </div>
        </div>
        )}
        <GeoPicker value={position} onChange={setPosition} />


        {/* Час заїзду та виїзду */}
        <div className="mb-2 row" style={{marginTop: 20}}>
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

        {/* уДОБСТВА */}
        <div className="mb-2">
          <label style={{ fontWeight: 500, marginTop: 20, marginBlockEnd: 10 }}>Features:</label>
          <div className="d-flex flex-wrap gap-2">
            {Object.keys(ESTABLISHMENT_FEATURE_LABELS).map(label => (
              <label key={label} className="d-flex align-items-center" style={{ minWidth: 160 }}>
                <input
                  type="checkbox"
                  checked={!!hotel.features[label]}
                  onChange={() =>
                    setHotel(prev => ({
                      ...prev,
                      features: { ...prev.features, [label]: !prev.features[label] }
                    }))
                  }
                />
                <span className="ms-2">{label}</span>
              </label>
            ))}

          </div>
        </div>

        {/* оПИС */}
        <div style={{marginTop: 30,}}>
          <b style={{fontWeight: 200}}>Description:</b>
        </div>
        <textarea name="description" style={{marginTop: 10}} value={hotel.description} onChange={handleChange} className="form-control mb-3" />

        <input
          type="file"
          accept="image/*"
          multiple
          className="form-control mb-3"
          onChange={handleFileChange}
        />

        <div className="mb-3 d-flex flex-wrap">
          {existingPhotos.map((p, idx) => (
            <div key={p.id || p.blobUrl || idx} className="me-2 mb-2 position-relative">
              <img src={p.blobUrl} alt="hotel" width={80} height={80} style={{ objectFit: "cover", borderRadius: 8, border: '1px solid #eee' }} />
              <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" style={{zIndex:1}} onClick={() => handleDeletePhoto(idx, true)}>×</button>
            </div>
          ))}

          {newPhotos.map((p, idx) => (
            <div key={`new_${idx}`} className="me-2 mb-2 position-relative">
              <img src={p} alt="new hotel" width={80} height={80} style={{ objectFit: "cover", borderRadius: 8, border: '1px solid #eee' }} />
              <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" style={{zIndex:1}} onClick={() => handleDeletePhoto(idx, false)}>×</button>
            </div>
          ))}
        </div>

        <button className="btn btn-success">Save</button>

        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </form>
    </div>

      </div>
    </div>

    
  );
};

export default EditHotel;
