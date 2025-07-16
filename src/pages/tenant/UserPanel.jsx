import React, { useEffect, useState } from "react";
import { getAllBookings } from "../../api/bookingApi";
import { getUserFavorites, removeFavorite } from "../../api/favoriteApi";
import { getApartmentById } from "../../api/apartmentApi";

const UserPanel = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return null;

  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apartmentMap, setApartmentMap] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phonenumber: user?.phonenumber,
  });

  // --- Додаткові дані для розділів (можна буде замінити на API)
  const [activeStep] = useState(2); // 1-2-3; поки статично
  const [tab, setTab] = useState("bookings");

  useEffect(() => {
    setLoading(true);
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const [bookData, favData] = await Promise.all([
          getAllBookings(),
          getUserFavorites(user.id),
        ]);
        setBookings(bookData);
        setFavorites(favData);
        const ids = [
          ...new Set([
            ...bookData.map((b) => b.apartmentId),
            ...favData.map((f) => f.apartmentId),
          ]),
        ].filter(Boolean);
        await loadApartments(ids);
      } catch (err) {
        console.error("Loading error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const loadApartments = async (ids) => {
    const newMap = {};
    for (let id of ids) {
      try {
        const apt = await getApartmentById(id);
        newMap[id] = apt;
      } catch (err) {
        // handle error
      }
    }
    setApartmentMap(newMap);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: PATCH request to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({
      username: user?.username || "",
      email: user?.email || "",
      phonenumber: user?.phonenumber || "",
    });
    setIsEditing(false);
  };

  const handleDeleteFavorite = async (favoriteId) => {
    await removeFavorite(favoriteId);
    setFavorites(favorites.filter((f) => f.id !== favoriteId));
  };

  // --- Розбивка бронювань
  const myBookings = bookings.filter(
    (b) => b.customer?.email && user && b.customer.email === user.email
  );
  const upcoming = myBookings.filter((b) => new Date(b.dateFrom) > new Date());
  const history = myBookings.filter((b) => new Date(b.dateTo) < new Date());

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString();
  };

  // --- Дані для правої колонки (заглушки або витягати з booking)
  const upcomingBooking = upcoming[0] || null; // наступне бронювання, якщо є
  const apt = upcomingBooking?.apartment || null;
  const hotel = apt?.establishment || null;

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
          height: "100%",
          boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
          marginTop: "60px",
        }}
      >
        {/* --- ПРОГРЕС-БАР --- */}
        <ProgressBar activeStep={activeStep} />

        {/* --- ДВІ КОЛОНКИ --- */}
        <div className="row mt-4" style={{ minHeight: 400 }}>

          {/* ЛІВА КОЛОНКА !!!!!! */}
          <div className="col-12 col-md-6 mb-4 mb-md-0" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            
            {/* 1. Інформація користувача */}
            <div style={{
              background: "#fcfcfc",  //
              borderRadius: 18,
              padding: 24,              
              boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)"   //
            }}>
              <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>Your details</div>
              <div className="d-flex align-items-center gap-3 mb-3">              
                <div>
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
              </div>            
            </div>
            
            {/* 2. Add to your booking */}
            <div style={{
              background: "#fcfcfc",
              borderRadius: 18,
              padding: 24,
              minHeight: 140,
              boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)"
            }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Add to your booking</div>
              <div style={{ color: "#444", fontSize: 15 }}>
                {/* Тут будуть чекбокси: "I need airfares for this trip", "Save on car hire", ... */}
                <div>
                  <input type="checkbox" id="needAirfares" disabled />{" "}
                  <label htmlFor="needAirfares" style={{ color: "#888" }}>I need airfares for this trip</label>
                </div>
                <div>
                  <input type="checkbox" id="saveCarHire" disabled />{" "}
                  <label htmlFor="saveCarHire" style={{ color: "#888" }}>I want to save up to 10% on car hire</label>
                </div>
                <div>
                  <input type="checkbox" id="saveTaxis" disabled />{" "}
                  <label htmlFor="saveTaxis" style={{ color: "#888" }}>I want to save 10% on airport taxis</label>
                </div>
                {/*  потім реалізувати як форми */}
              </div>
            </div>


            {/* --- Блок "Favorites" в новому стилі --- */}
              <div
                style={{
                  background: "#fcfcfc",
                  borderRadius: 18,
                  padding: 24,
                  marginBottom: 24,
                  minHeight: 120,
                  boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.15)"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: "#183E6B" }}>
                  Your favorite hotels
                </div>
                {favorites.length === 0 ? (
                  <div className="text-muted">No favorites found</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {favorites.map((f) => {
                      const apt = f.apartment;
                      const hotel = apt?.establishment;
                      return (
                        <div
                          key={f.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderRadius: 14,
                            padding: "14px 18px",
                            background: "#f3f8fe",
                            border: "1px solid #e1ecfa",
                            marginBottom: 2,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: "#02457A", fontSize: 17 }}>
                              🏨 {hotel?.name || "Hotel " + (hotel?.id || "?")}
                            </div>
                            {apt?.id && (
                              <div style={{ color: "#555", fontSize: 15 }}>
                                Room: <span style={{ fontWeight: 500 }}>{apt.name}</span>
                              </div>
                            )}
                            <div className="text-muted" style={{ fontSize: 13 }}>
                              {hotel?.address}
                            </div>
                          </div>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            style={{
                              fontWeight: 600,
                              minWidth: 75,
                              borderRadius: 10,
                              marginLeft: 10,
                            }}
                            onClick={() => handleDeleteFavorite(f.id)}
                          >
                            Delete
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

          </div>

          

          {/* ПРАВА КОЛОНКА !!!!!!!! */}
<div className="col-12 col-md-6 d-flex flex-column gap-3">
  {upcoming.length === 0 ? (
    <div style={{
      background: "#fcfcfc",
      borderRadius: 18,
      padding: 24,
      minHeight: 120,
      boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)",
      marginBottom: 18,
    }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your upcoming hotels</div>
      <div className="text-muted">Here will be shown your next hotel</div>
    </div>
  ) : (
    upcoming.map((booking, idx) => {
      const apt = booking.apartment;
      const hotel = apt?.establishment;
      return (
        <div key={booking.id} style={{ marginBottom: 32 }}>
          {/* --- Hotel info --- */}
          <div style={{
            background: "#fcfcfc",
            borderRadius: 18,
            padding: 24,
            minHeight: 120,
            boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)",
            marginBottom: 14,
          }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your upcoming hotels</div>
            <div style={{ fontWeight: 800 }}>{hotel?.name || "Hotel"}</div>
            <span style={{ fontWeight: 400 }}>Hotel</span>{" "}
            <div style={{ color: "#567" }}>{hotel?.address}</div>
            <div>{"★".repeat(hotel?.stars || 4)}</div>
            <div className="mt-2 text-muted" style={{ fontSize: 13 }}>{apt?.name}</div>
          </div>

          {/* --- Booking details --- */}
          <div style={{
            background: "#fcfcfc",
            borderRadius: 18,
            padding: 24,
            minHeight: 120,
            boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)",
            marginBottom: 14,
          }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your booking details</div>
            <div>Check-in: <b>{formatDate(booking.dateFrom)}</b></div>
            <div>Check-out: <b>{formatDate(booking.dateTo)}</b></div>
            <div>Guests: {booking.guestsCount || 2}</div>
            <div>Status: <span style={{ color: booking.isCheckedIn ? "#29b56f" : "#f9a825", fontWeight: 600 }}>
              {booking.isCheckedIn ? "Checked in" : "Awaiting check-in"}
            </span></div>
          </div>

          {/* --- Payment details --- */}
          <div style={{
            background: "#fcfcfc",
            borderRadius: 18,
            padding: 24,
            minHeight: 120,
            boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)",
          }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your payment details</div>
            <div>
              <span>Total price:</span>{" "}
              <b>
                {booking.price || "----"} {booking.currency || "UAH"}
              </b>
            </div>
            <div>
              Status:{" "}
              <span style={{ color: "#29b56f", fontWeight: 600 }}>
                {booking.isPaid ? "Paid" : "Not paid"}
              </span>
            </div>
          </div>

          {/* --- HR between bookings --- */}
          {idx < upcoming.length - 1 && <hr style={{ margin: "32px 0", borderTop: "2px solid #dde2e7" }} />}
        </div>
      )
    })
  )}
</div>

        </div>
      </div>
    </div>
  );
};

// --- ПРОГРЕС-БАР (3 кроки)
function ProgressBar({ activeStep }) {
  // 1: Your choice, 2: Your details, 3: Completing your booking
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "2px solid #d5e3f7",
      paddingBottom: 8,
      marginBottom: 14
    }}>
      {["Your choice", "Your details", "Completing your booking"].map((step, i) => (
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

export default UserPanel;
