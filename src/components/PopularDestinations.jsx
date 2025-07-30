import React, { useEffect, useState, useMemo } from "react";
import { getAllEstablishments } from "../api/establishmentsApi";
import { getAllBookings } from "../api/bookingApi";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";



const cardStyles = {
  borderRadius: 18,
  boxShadow: "0 4px 20px 0 rgba(40,46,72,0.09)",
  background: "#fff",
  overflow: "hidden",
  position: "relative",
  minHeight: 170,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end"
};

const PopularDestinations = () => {
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllEstablishments(), getAllBookings()])
      .then(([hotelsData, bookingsData]) => {
        setHotels(hotelsData);
        setBookings(bookingsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const popularHotels = useMemo(() => {
  if (!hotels.length) return [];

  const bookingsCount = {};
  bookings.forEach(b => {
    const estId = b.apartment?.establishment?.id || b.establishment?.id;
    if (estId) bookingsCount[estId] = (bookingsCount[estId] || 0) + 1;
  });

  const hotelsWithCount = hotels.map(hotel => ({
    ...hotel,
    bookingsCount: bookingsCount[hotel.id] || 0,
  }));

  hotelsWithCount.sort((a, b) => b.bookingsCount - a.bookingsCount);

  return hotelsWithCount; // ← ПОВНИЙ СПИСОК!
}, [hotels, bookings]);

const displayHotels = popularHotels.slice(0, 5);


  if (loading) {
    return (
      <section className="my-5">
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          Loading popular destinations...
        </div>
      </section>
    );
  }

  if (popularHotels.length === 0) {
    return (
      <section className="my-5">
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          No hotels found.
        </div>
      </section>
    );
  }

  return (
    <section className="my-5">
      <div style={{ maxWidth: 1200, margin: "0 auto", marginTop: 100 }}>
        {/* Header */}
        <div className="d-flex align-items-end justify-content-between mb-3 flex-wrap">
          <div>
            <h2 className="fw-bold mb-0" style={{ fontSize: 24, color: "#1b3966" }}>Popular destinations</h2>
            <div style={{ fontSize: 15, color: "#ff9800", marginTop: 2 }}>Discover famous destination around the world</div>
          </div>
          <button
            className="btn btn-link fw-bold"
            style={{ color: "#1b3966", fontSize: 15, textDecoration: "none" }}
            onClick={() => navigate("/hotels", {
              state: {
                source: "PopularDestinations",
                hotels: popularHotels, // ← передаєш усі!
                title: "Popular Destinations"
              }
            })}
          >
            See all →
          </button>

        </div>
        {/* Grid */}
        <div
          className="d-grid gap-4"
          style={{
            gridTemplateColumns: "1.2fr 1.4fr 1.4fr",
            gridTemplateRows: "1fr 1fr",
            minHeight: 400,
          }}
        >
            
          {/* Перший готель — вертикальний */}
          
            <div
                style={{
                    ...cardStyles,
                    gridRow: "1 / 3",
                    gridColumn: "1 / 2",
                    minHeight: 350,
                    maxWidth: 330,
                    padding: 0,
                    position: "relative",
                    background: "none",
                    boxShadow: "none",
                    cursor: "pointer"
                }}
                onClick={() => navigate(`/hotels/${hotel.id}`)}
                >
                <div style={{
                    position: "relative",
                    width: "100%",
                    height: "100%", 
                    minHeight: 400,
                    borderRadius: 18,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column"
                    }}>
                    <img
                        src={popularHotels[0]?.photos?.[0]?.blobUrl || "/noimage.png"}
                        alt={popularHotels[0]?.name}
                        style={{
                        width: "100%",
                        height: "100%",
                        minHeight: 400,
                        objectFit: "cover",
                        display: "block",
                        aspectRatio: "4/5", 
                        }}
                    />
                {/* Блок з текстом поверх фото */}
                    <div style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 34,
                    margin: "0 0px",
                    background: "rgba(255,255,255,0.87)",
                    padding: "20px 24px 12px 20px",
                    boxShadow: "0 6px 22px 0 rgba(40,46,72,0.14)",
                    minHeight: 120,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end"
                    }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                        <span style={{ fontWeight: 700, fontSize: 19, color: "#2C5C4E" }}>{popularHotels[0]?.name}</span>
                        <span style={{
                        background: "rgba(255,255,255,0.96)",
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#FE7C2C",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.11)",
                        padding: "2px 10px",
                        marginLeft: 8,
                        display: "flex",
                        alignItems: "center"
                        }}>
                        
                        <img src="/images/reitingstar-orange.png" alt="" style={{ width: 16, height: 16, marginRight: 5, verticalAlign: "middle" }} />
                        {displayHotels[0]?.rating?.toFixed(1) ?? "—"}
                        </span>
                    </div>
                    
                    <div style={{ fontWeight: 400, fontSize: 13, color: "#333" }}>{popularHotels[0]?.description}</div>
                <div style={{ fontWeight: 400, fontSize: 13, color: "#666", marginTop: 4 }}>Бронювань: {popularHotels[0]?.bookingsCount}</div>
            </div>
        </div>
        </div>

          {/* Решта 4 — горизонтальні */}
          {displayHotels.slice(1).map((hotel, idx) => (
            <div
                key={hotel.id}
                style={{
                ...cardStyles,
                minHeight: 175,
                gridColumn: idx % 2 === 0 ? 2 : 3,
                gridRow: idx < 2 ? 1 : 2,
                padding: 0,
                background: "none",
                boxShadow: "none",
                position: "relative",
                cursor: "pointer"
                }}
                onClick={() => navigate(`/hotels/${hotel.id}`)}
            >
                <div style={{ position: "relative", width: "100%", height: 270, borderRadius: 6, overflow: "hidden" }}>
                <img
                    src={hotel.photos?.[0]?.blobUrl || "/noimage.png"}
                    alt={hotel.name}
                    style={{
                    width: "100%",
                    height: 270,
                    objectFit: "cover",
                    display: "block",
                    }}
                />
                {/* Текст поверх фото */}
                <div style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "0 0 6px 6px",
                    padding: "14px 18px 10px 14px",
                    boxShadow: "0 4px 12px 0 rgba(40,46,72,0.14)",
                    minHeight: 60,
                }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#2C5C4E" }}>{hotel.name}</span>
                    <span style={{
                        backdropFilter: "blur(4px)",
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#FE7C2C",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.11)",
                        padding: "2px 8px",
                        marginLeft: 8,
                        display: "flex",
                        alignItems: "center"
                    }}>                        
                        <img src="/images/reitingstar-orange.png" alt="" style={{ width: 14, height: 14, marginRight: 5, verticalAlign: "middle" }} />
                        {hotel.rating?.toFixed(1) ?? "—"}
                    </span>
                    </div>
                    
                    <div style={{ fontWeight: 400, fontSize: 12, color: "#444" }}>{hotel.description}</div>
                    <div style={{ fontWeight: 400, fontSize: 12, color: "#888", marginTop: 2 }}>Бронювань: {hotel.bookingsCount}</div>
                </div>
                </div>
            </div>
            ))}

        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
