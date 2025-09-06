import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";
import { getEstablishmentsByOwnerFiltered } from "../../api/establishmentsApi";
import LandEstablishmentCard from "./LandEstablishmentCard";
import { Link } from "react-router-dom";
import { ESTABLISHMENT_TYPE_LABELS } from "../../utils/enums";
import { uploadUserPhoto, updateUserDetails, getUserImages } from "../../api/userApi";

const LandPanel = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [establishments, setEstablishments] = useState([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    photoBase64: "",
    photoPreview: "",
  });
  const fileRef = useRef(null);
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    if (user?.id) {
      const filter = {};
      getEstablishmentsByOwnerFiltered(user.id, filter)
        .then(setEstablishments)
        .catch(console.error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedType) {
      const filtered = establishments.filter(est => est.type === selectedType);
      setFilteredEstablishments(filtered);
    }
  }, [selectedType, establishments, setFilteredEstablishments]);

  const reloadStats = () => {
    if (user?.id) {
      const filter = {};
      getEstablishmentsByOwnerFiltered(user.id, filter)
        .then(setEstablishments)
        .catch(console.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setEditedUser({
      username: user?.username || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      photoBase64: "",
      photoPreview: "",
    });
    setIsEditing(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditedUser(prev => ({
        ...prev,
        photoBase64: ev.target.result,
        photoPreview: ev.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const payload = {
        username: (editedUser.username || "").trim(),
        email: (editedUser.email || "").trim(),
        phoneNumber: (editedUser.phoneNumber || "").trim(),
        bio: (editedUser.bio || "").trim?.() || ""
      };
      await updateUserDetails(payload);

      let images = user?.photos || [];
      if (editedUser.photoBase64) {
        await uploadUserPhoto(editedUser.photoBase64);
        images = await getUserImages();
      }
      const current = JSON.parse(localStorage.getItem("user") || "{}");
      const nextUser = {
        ...current,
        ...payload,
        photos: images || [],
        photoUrl: images?.[0]?.blobUrl || current.photoUrl,
      };

      localStorage.setItem("user", JSON.stringify(nextUser));
      dispatch(setUser(nextUser));
      setIsEditing(false);
      setEditedUser(u => ({ ...u, photoBase64: "", photoPreview: "" }));
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error("Error saving profile:", err?.response || err);
    }
  };

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          padding: "32px 36px 32px 36px",
          width: "100%",
          maxWidth: "98vw",
          boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
          marginTop: "60px",
        }}
      >
        <div className="row mt-4" style={{ minHeight: 500 }}>
          <div className="col-12 col-md-8 mb-4 mb-md-0" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{
              background: "#fcfcfc",
              borderRadius: 18,
              padding: 24,
              boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)",
              position: "relative"
            }}>
              {(user?.photoUrl || user?.photos?.[0]?.blobUrl) && (
                <img
                  src={user?.photoUrl || user?.photos?.[0]?.blobUrl}
                  alt="User avatar"
                  width={90}
                  height={90}
                  style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid #eee", marginBottom: 30 }}
                />
              )}
              {isEditing ? (
                <>
                  <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
                    <label style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0e590e", display: "block" }}>
                      Profile photo
                    </label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={handlePhotoChange}
                    />
                    {editedUser.photoPreview && (
                      <img
                        src={editedUser.photoPreview}
                        alt="User avatar"
                        width={90}
                        height={90}
                        style={{ display: "block", borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }}
                      />
                    )}
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0e590e", display: "block" }}>
                      Full name
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      style={{
                        borderRadius: 16,
                        fontWeight: 500,
                        border: "1.5px solid #02457A",
                        background: "transparent",
                        minHeight: 44,
                        fontSize: 16,
                        paddingLeft: 16,
                        marginBottom: 6,
                      }}
                      value={editedUser.username}
                      onChange={handleInputChange}
                      placeholder="Full name"
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0e590e", display: "block" }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      style={{
                        borderRadius: 16,
                        fontWeight: 500,
                        border: "1.5px solid #02457A",
                        background: "transparent",
                        minHeight: 44,
                        fontSize: 16,
                        paddingLeft: 16,
                        marginBottom: 6,
                      }}
                      value={editedUser.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                    />
                    <div style={{ fontSize: 13, color: "#6E7C87", fontWeight: 400, marginTop: 2 }}>
                      A booking confirmation will be sent to this address
                    </div>
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <label style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0e590e", display: "block" }}>
                      Telephone number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      className="form-control"
                      style={{
                        borderRadius: 16,
                        fontWeight: 500,
                        border: "1.5px solid #02457A",
                        background: "transparent",
                        minHeight: 44,
                        fontSize: 16,
                        paddingLeft: 16,
                        marginBottom: 6,
                      }}
                      value={editedUser.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                    />
                    <div style={{ fontSize: 13, color: "#6E7C87", fontWeight: 400, marginTop: 2 }}>
                      To confirm your level and be able to contact you if necessary
                    </div>
                  </div>

                  <div className="d-flex gap-2" style={{ marginTop: 12 }}>
                    <button className="btn btn-sm" style={{ minWidth: 80, background: '#02457A', color: 'white' }} onClick={handleSave}>
                      Save
                    </button>
                    <button className="btn btn-outline-primary btn-sm" style={{ minWidth: 80 }} onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 16 }}>
                    <span style={{ fontWeight: 400 }}>Full name:</span>{" "}
                    <span style={{ fontWeight: 700 }}>{user?.username}</span>
                  </div>
                  <div style={{ fontSize: 16, marginBlockStart: 20 }}>
                    <span style={{ fontWeight: 400 }}>Email:</span>{" "}
                    <span style={{ fontWeight: 700 }}>{user?.email}</span>
                  </div>
                  <div style={{ fontSize: 16, marginBlockStart: 20 }}>
                    <span style={{ fontWeight: 400 }}>Phone number:</span>{" "}
                    <span style={{ fontWeight: 700 }}>{user?.phoneNumber}</span>
                  </div>
                  <button
                    className="btn btn-outline-primary btn-sm mt-4"
                    style={{ borderRadius: 12, fontWeight: 600, minWidth: 80, position: "absolute", top: 0, right: 20 }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <select
                id="typeSelect"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                style={{ minWidth: 180, borderRadius: 10, border: "1px solid #9ad8ef", padding: 6, fontWeight: 500, fontSize: 16 }}
              >
                <option value="">All types</option>
                {Object.entries(ESTABLISHMENT_TYPE_LABELS).map(([label, value]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <Link to="/add-hotel" className="btn btn-success">
                ➕ Add hotel
              </Link>
            </div>

            <div style={{
              background: "#fcfcfc",
              borderRadius: 18,
              padding: 24,
              boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.15)",
              marginTop: 12
            }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10, color: "#183E6B" }}>
                Your hotels
              </div>
              {establishments.length === 0 ? (
                <div className="text-muted">You don't have any hotels yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(selectedType ? filteredEstablishments : establishments).map((est) => (
                    <LandEstablishmentCard key={est.id} est={est} reloadStats={reloadStats} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-md-4 d-flex flex-column gap-3">
            <div style={{
              background: "#fcfcfc",
              borderRadius: 18,
              padding: 24,
              minHeight: 120,
              boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.13)"
            }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                Welcome, Landlord!
              </div>
              <div style={{ color: "#567" }}>
                Here you can manage your hotels, apartments and reservations. Use the buttons above to add new hotels or view your current properties.
              </div>
            </div>

            <div style={{
              background: "#fcfcfc",
              borderRadius: 18,
              padding: 24,
              boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.17)"
            }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>General statistics</div>
              <div style={{ color: "#183E6B", fontWeight: 500 }}>
                <span style={{ marginRight: 16 }}>🏨 Hotels: <b>{establishments.length}</b></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandPanel;
