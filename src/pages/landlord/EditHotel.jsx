import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getEstablishmentById, updateEstablishment } from "../../api/establishmentsApi";
import GeoPicker from "../../components/GeoPicker";
import {
  ESTABLISHMENT_TYPE_LABELS,
  ESTABLISHMENT_FEATURE_LABELS
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
  const featuresEnumKeys = Object.keys(ESTABLISHMENT_FEATURE_LABELS);


  const [hotel, setHotel] = useState({
    name: "",
    description: "",
    type: 0, 
    features: 0, 
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

  useEffect(() => {
    getEstablishmentById(id)
      .then((data) => {
        let featuresValue = 0;
        const enumKeys = Object.keys(ESTABLISHMENT_FEATURE_LABELS);
        if (typeof data.features === 'object' && data.features !== null) {
          enumKeys.forEach((key, idx) => {
            if (data.features[key]) featuresValue |= (1 << idx);
          });
        } else {
          featuresValue = data.features ?? 0;
        }
        setHotel({
          name: data.name || "",
          description: data.description || "",
          type: data.type ?? 0,           
          features: featuresValue,  
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
      const existingPhotosIds = existingPhotos.map(p => p.id);
      const getPureBase64 = (dataUrl) => dataUrl.split(',')[1];
      const base64Only = newPhotos.map(getPureBase64);

      const payload = {
        name: hotel.name,
        description: hotel.description,
        type: hotel.type,
        features: hotel.features,
        checkInTime: `${String(checkInHour).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}:00`,
        checkOutTime: `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}:00`,
        ownerId: hotel.ownerId || user?.id,
        existingPhotosIds,
        newPhotosBase64: base64Only,
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
    <div className="container mt-4">
      <h3>✏️ Edit hotel</h3>
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
  );
};

export default EditHotel;
