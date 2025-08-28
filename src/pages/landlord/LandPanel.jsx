import React, { useEffect, useState } from "react";
import { useSelector, useDispatch  } from "react-redux";
import { axiosInstance } from "../../api/axios";
import { setUser } from "../../store/slices/userSlice";
import { getEstablishmentsByOwnerFiltered } from "../../api/establishmentsApi";
import LandEstablishmentCard from "./LandEstablishmentCard";
import { Link, useNavigate } from "react-router-dom";
import { ESTABLISHMENT_TYPE_LABELS } from "../../utils/enums";
import { uploadUserPhoto, updateUserDetails } from "../../api/userApi";
import { toast } from "react-toastify";



const LandPanel = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    photoBase64: "",
    photoPreview: user?.photoUrl || "",
  });
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    if (user?.id) {
      const filter = {};
      if (selectedType !== "") filter.type = selectedType;
      getEstablishmentsByOwnerFiltered(user.id, filter)
        .then(setEstablishments)
        .catch(console.error);
    }
  }, [user, selectedType]);

  const reloadStats = () => {
    if (user?.id) {
      const filter = {};
      if (selectedType !== "") filter.type = selectedType;
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
    });
    setIsEditing(false);
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

      if (editedUser.photoBase64) {
        await uploadUserPhoto(editedUser.photoBase64);
      }

      const current = JSON.parse(localStorage.getItem("user") || "{}");
      const nextUser = {
        ...current,
        username: payload.username,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        photoUrl: editedUser.photoPreview || current.photoUrl
      };
      localStorage.setItem("user", JSON.stringify(nextUser));
      dispatch(setUser(nextUser));
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err?.response || err);
    }
  };

  const handleLogout = () => {
    dispatch(setUser(null));

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (axiosInstance?.defaults?.headers?.common?.Authorization) {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
    toast.success("You have been logged out", { autoClose: 2000 });

    navigate("/");
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
          {/* ЛІВА КОЛОНКА */}
          <div className="col-12 col-md-8 mb-4 mb-md-0" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Особиста інформація */}
            <div style={{
              background: "#fcfcfc",
              borderRadius: 18,
              padding: 24,
              boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)"
            }}>
              <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>Your details</div>
              {isEditing ? (
                <>
                  {/* Аватар + завантаження фото */}
                <div style={{ marginBottom: 24 }}>
                  {editedUser.photoPreview && (
                    <img
                      src={editedUser.photoPreview}
                      alt="User avatar"
                      width={90}
                      height={90}
                      style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid #eee", marginBottom: 12 }}
                    />
                  )}
                  <label style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0e590e", display: "block" }}>
                    Profile photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handlePhotoChange}
                  />
                  {editedUser.photoPreview && (
                    <button
                      className="btn btn-primary btn-sm mt-2"
                      style={{ borderRadius: 10, fontWeight: 600, minWidth: 110 }}
                      disabled={!editedUser.photoBase64}
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await uploadUserPhoto(editedUser.photoBase64);
                          // за бажанням: toast.success("Profile photo updated!")
                        } catch (err) {
                          console.error("Failed to upload photo", err);
                          // за бажанням: toast.error("Failed to upload photo")
                        }
                      }}
                    >
                      Save photo
                    </button>
                  )}
                </div>

                  {/* Full name */}
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

                  {/* Email */}
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

                  {/* Phone */}
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

                  {/* --------- Email Confirmation та Save new data --------- */}
                  <div style={{ marginBottom: 22 }}>
                    <div>
                      <input type="checkbox" id="emailConfirm" style={{ accentColor: "#02457A" }} />
                      <label htmlFor="emailConfirm" style={{ marginLeft: 10, fontSize: 16, color: "#02457A", fontWeight: 600 }}>
                        Yes, send me a free email confirmation <span style={{ fontWeight: 400 }}>(recommended)</span>
                      </label>
                      <div style={{ marginLeft: 32, color: "#737373", fontSize: 13, marginBottom: 4 }}>
                        We will send you a link to download our application
                      </div>
                    </div>
                    <div>
                      <input type="checkbox" id="saveData" style={{ accentColor: "#02457A" }} />
                      <label htmlFor="saveData" style={{ marginLeft: 10, fontSize: 16, color: "#02457A", fontWeight: 600 }}>
                        Save new data to account
                      </label>
                    </div>
                  </div>

                  {/* --------- Special Requests --------- */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 700, color: "#207147", fontSize: 19, marginBottom: 8 }}>
                      Tell us about your special requests
                    </div>
                    <div style={{ color: "#555", fontSize: 14, marginBottom: 8 }}>
                      The administration of the accommodation cannot guarantee the fulfillment of special requests, but will do everything possible to ensure this. You can always leave a special request after completing the booking!
                    </div>
                    <label htmlFor="specialRequests" style={{ fontSize: 16, marginBottom: 5, color: "#02457A", display: "block" }}>
                      Please write your requests
                    </label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      rows={3}
                      style={{
                        width: "100%",
                        border: "1.5px solid #02457A",
                        borderRadius: 16,
                        fontSize: 15,
                        padding: 12,
                        resize: "vertical",
                        background: "transparent",
                        color: "#001B48"
                      }}
                      placeholder="Write here..."
                    />
                  </div>

                  {/* Buttons */}
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
                    style={{ borderRadius: 12, fontWeight: 600, minWidth: 80 }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>

                  <button
                      className="btn btn-danger btn-sm mt-4"
                      style={{ borderRadius: 12, fontWeight: 600, minWidth: 250, marginLeft: 20 }}
                      onClick={handleLogout}
                    >
                      Log Out
                  </button>
                </>
              )}
            </div>

            {/* Загальна статистика */}
            <div style={{
              background: "#fcfcfc",
              borderRadius: 18,
              padding: 24,
              boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.17)"
            }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>General statistics</div>
              <div style={{ color: "#183E6B", fontWeight: 500 }}>
                <span style={{ marginRight: 16 }}>🏨 Hotels: <b>{establishments.length}</b></span>
                {/* Apartments і Reservations поки не показуємо, додамо пізніше */}
              </div>
            </div>

            {/* Кнопки дій */}
            <div style={{ display: "flex", gap: 16 }}>
              <Link to="/add-hotel" className="btn btn-success">
                ➕ Add a new hotel
              </Link>
            </div>

            {/* --- Фільтр по типу --- */}
            <div>
              <label htmlFor="typeSelect" style={{ fontWeight: 600, fontSize: 15, marginBottom: 5, display: "block", color: "#165188" }}>
                Filter by type
              </label>
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
            </div>

            {/* --- Список готелів --- */}
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
                  {establishments.map((est) => (
                    <LandEstablishmentCard key={est.id} est={est} reloadStats={reloadStats} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ПРАВА КОЛОНКА */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandPanel;
