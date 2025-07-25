import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAllEstablishments } from "../../api/establishmentsApi";
import { fetchApartments } from "../../api/apartmentApi";
import LandEstablishmentCard from "./LandEstablishmentCard";
import { Link } from "react-router-dom";

// --- Можна винести у окремий файл, як у UserPanel ---
function ProgressBar({ activeStep }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "2px solid #d5e3f7",
      paddingBottom: 8,
      marginBottom: 14
    }}>
      {["Dashboard", "Your Hotels", "Editing"].map((step, i) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          color: i < activeStep ? "#24ac70" : "#555",
          fontWeight: i === activeStep - 1 ? 700 : 500,
          fontSize: 17,
        }}>
          <span style={{
            display: "inline-block",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: i < activeStep ? "#24ac70" : "#e9e9e9",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "22px",
            textAlign: "center",
            marginRight: 8,
            border: i === activeStep - 1 ? "2px solid #2ca377" : "2px solid #e9e9e9"
          }}>{i + 1}</span>
          {step}
          {i !== 2 && <span style={{
            display: "inline-block",
            width: 70,
            height: 3,
            background: i < activeStep - 1 ? "#24ac70" : "#e9e9e9",
            margin: "0 16px",
            borderRadius: 2
          }} />}
        </div>
      ))}
    </div>
  );
}

const LandPanel = () => {
  const user = useSelector((state) => state.user.user);
  const [establishments, setEstablishments] = useState([]);
  const [showHotels, setShowHotels] = useState(false);

  const [totalApartments, setTotalApartments] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (user?.id) {
      Promise.all([getAllEstablishments(), fetchApartments()])
        .then(([estData, aptData]) => {
          const myEstablishments = estData.filter(e => e.owner && e.owner.email === user.email);
          const myEstIds = myEstablishments.map(e => e.id);
          const myApartments = aptData.filter(a => myEstIds.includes(a.establishment.id));
          setEstablishments(myEstablishments);
          setTotalApartments(myApartments.length);
        })
        .catch(console.error);
    }
  }, [user]);

  const reloadStats = () => {
    if (user?.id) {
      Promise.all([getAllEstablishments(), fetchApartments()])
        .then(([estData, aptData]) => {
          const myEstablishments = estData.filter(e => e.owner && e.owner.email === user.email);
          const myEstIds = myEstablishments.map(e => e.id);
          const myApartments = aptData.filter(a => myEstIds.includes(a.establishment.id));
          setEstablishments(myEstablishments);
          setTotalApartments(myApartments.length);
        })
        .catch(console.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: PATCH to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({
      username: user?.username || "",
      email: user?.email || "",
    });
    setIsEditing(false);
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
        {/* --- ПРОГРЕС-БАР --- */}
        <ProgressBar activeStep={2} />

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
                      name="phonenumber"
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
                      value={editedUser.phonenumber}
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
                        <span style={{ fontWeight: 700 }}>{user?.phonenumber}</span>
                      </div>
                      
                      <button
                        className="btn btn-outline-primary btn-sm mt-4"
                        style={{ borderRadius: 12, fontWeight: 600, minWidth: 80 }}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
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
                <span style={{ marginRight: 16 }}>🚪 Apartments: <b>{totalApartments}</b></span>
                <span>📅 Reservations: <b>{totalBookings}</b></span>
              </div>
            </div>

            {/* Кнопки дій */}
            <div style={{ display: "flex", gap: 16 }}>              
              <Link to="/add-hotel" className="btn btn-success">
                ➕ Add a new hotel
              </Link>
            </div>

            {/* Список готелів */}
            {<div style={{
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
              </div>}
          </div>

          {/* ПРАВА КОЛОНКА (можливості сторінки, або можна буде додати допоміжну інформацію) */}
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
