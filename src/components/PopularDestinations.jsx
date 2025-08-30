import React, { useEffect, useState, useMemo } from "react";
import { getTrendingEstablishments } from "../api/establishmentsApi";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axios";
import { isHotelFavorite, toggleHotelFavorite } from "../utils/favoriteUtils";
import { toast } from "react-toastify";


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
  justifyContent: "flex-end",
};

const fmt1 = v =>
  v != null && Number.isFinite(Number(v)) ? Number(v).toFixed(1) : "—";

const PopularDestinations = ({ search = "" }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apartments, setApartments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const token = localStorage.getItem("token");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTrendingEstablishments(12, 365),
      axiosInstance.get("/api/apartments"),(userId && token)
        ? Promise.resolve(JSON.parse(localStorage.getItem("favorites") || "[]"))
        : Promise.resolve([]),
    ])
      .then(([trending, apartmentsData, favoritesData]) => {
        const list = Array.isArray(trending) ? trending : trending?.items || [];
        setHotels(list);
        setApartments(apartmentsData.data);
        setFavorites(favoritesData);
      })
      .catch(err => console.error("Download error:", err))
      .finally(() => setLoading(false));
    
      const onStorage = (e) => {
        if (e.key === "favorites") {
          try { setFavorites(JSON.parse(e.newValue || "[]")); } catch {}
        }
      };
      const onLocal = () => {
        try { setFavorites(JSON.parse(localStorage.getItem("favorites") || "[]")); } catch {}
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener("favorites-updated", onLocal);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("favorites-updated", onLocal);
      };

  }, [userId, token]);

  const searchLower = (search || "").trim().toLowerCase();

  const hotelsToShow = useMemo(() => {
    if (!searchLower) return hotels;
    const filtered = hotels.filter(h => {
      const country = (h.geolocation?.country || "").toLowerCase();
      const city = (h.geolocation?.city || "").toLowerCase();
      return (
        (h.name || "").toLowerCase().includes(searchLower) ||
        country.includes(searchLower) ||
        city.includes(searchLower)
      );
    });
    return filtered.length ? filtered : hotels;
  }, [hotels, searchLower]);

  const displayHotels = hotelsToShow.slice(0, 5);

  if (loading) {
    return (
      <section className="my-5">
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          Loading popular destinations...
        </div>
      </section>
    );
  }

  if (displayHotels.length === 0) {
    return (
      <section className="my-5">
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          No hotels found.
        </div>
      </section>
    );
  }

  const firstHotel = displayHotels[0];
  const isFavoriteFirst = isHotelFavorite(favorites, firstHotel?.id);

  return (
    <section className="my-5">
      <div style={{ maxWidth: 1200, margin: "0 auto", marginTop: 100 }}>
        {/* Header */}
        <div className="d-flex align-items-end justify-content-between mb-3 flex-wrap">
          <div>
            <h2 className="fw-bold mb-0" style={{ fontSize: 24, color: "#1b3966" }}>
              Popular destinations
            </h2>
            <div style={{ fontSize: 15, color: "#ff9800", marginTop: 2 }}>
              Discover famous destination around the world
            </div>
          </div>
          <button
            className="btn btn-link fw-bold"
            style={{ color: "#1b3966", fontSize: 15, textDecoration: "none" }}
            onClick={() => navigate("/hotels?trending=1&days=365")}
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
          {/* Перший (великий) */}
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
              cursor: "pointer",
            }}
            onClick={() => navigate(`/hotels/${firstHotel?.id}`)}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: 400,
                borderRadius: 18,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <img
                src={firstHotel?.photos?.[0]?.blobUrl || "/noimage.png"}
                alt={firstHotel?.name}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 400,
                  objectFit: "cover",
                  display: "block",
                  aspectRatio: "4/5",
                }}
              />

              {/* favorite */}
              <button
                style={{
                  position: "absolute",
                  right: 20,
                  top: 16,
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "50%",
                  border: "none",
                  width: 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  boxShadow: "0 0 12px #eee",
                  color: "#BF9D78",
                }}
                onClick={e => {
                  e.stopPropagation();

                  const user = JSON.parse(localStorage.getItem("user"));
                  const token = localStorage.getItem("token");

                  if (!(user?.id && token)) {
                    console.warn("User not authorized – cannot toggle favorite");
                       toast.info("Please log in to add to favorites");
                    return;
                  }

                  toggleHotelFavorite({
                    user,
                    favorites,
                    setFavorites,
                    establishmentId: firstHotel?.id,
                  });
                }}
              >
                <img
                  src="/images/favorite.png"
                  alt="favorite"
                  style={{
                    width: 38,
                    filter: isFavoriteFirst ? "none" : "grayscale(1)",
                  }}
                />
              </button>


              {/* Текст */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 34,
                  background: "rgba(255,255,255,0.87)",
                  padding: "20px 24px 12px 20px",
                  boxShadow: "0 6px 22px 0 rgba(40,46,72,0.14)",
                  minHeight: 120,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span style={{ fontWeight: 700, fontSize: 19, color: "#2C5C4E" }}>
                    {firstHotel?.name}
                  </span>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.96)",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#FE7C2C",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.11)",
                      padding: "2px 10px",
                      marginLeft: 8,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src="/images/reitingstar-orange.png"
                      alt=""
                      style={{ width: 16, height: 16, marginRight: 5, verticalAlign: "middle" }}
                    />
                    {fmt1(firstHotel?.rating?.generalRating)}
                  </span>
                </div>

                <div style={{ fontWeight: 400, fontSize: 13, color: "#333" }}>
                  {firstHotel?.description}
                </div>
              </div>
            </div>
          </div>

          {/* Решта 4 */}
          {displayHotels.slice(1).map((hotel, idx) => {

            const isFavorite = isHotelFavorite(favorites, hotel.id);

            return (
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
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/hotels/${hotel.id}`)}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 270,
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={hotel.photos?.[0]?.blobUrl || "/noimage.png"}
                    alt={hotel.name}
                    style={{ width: "100%", height: 270, objectFit: "cover", display: "block" }}
                  />

                  {/* favorite */}
                  <button
                    style={{
                      position: "absolute",
                      right: 20,
                      top: 16,
                      background: "rgba(255,255,255,0.95)",
                      borderRadius: "50%",
                      border: "none",
                      width: 38,
                      height: 38,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                      boxShadow: "0 0 12px #eee",
                      color: "#BF9D78",
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      const user = JSON.parse(localStorage.getItem("user"));
                      const token = localStorage.getItem("token");
                      if (!(user?.id && token)) {
                        console.warn("User not authorized – cannot toggle favorite");
                        toast.info("Please log in to add to favorites");
                        return;
                      }
                      toggleHotelFavorite({
                        user,
                        favorites,
                        setFavorites,
                        establishmentId: hotel.id,
                      });
                    }}
                  >
                    <img
                      src="/images/favorite.png"
                      alt="favorite"
                      style={{ width: 38, filter: isFavorite ? "none" : "grayscale(1)" }}
                    />
                  </button>

                  <div
                    style={{
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
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span style={{ fontWeight: 700, fontSize: 16, color: "#2C5C4E" }}>
                        {hotel.name}
                      </span>
                      <span
                        style={{
                          backdropFilter: "blur(4px)",
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#FE7C2C",
                          boxShadow: "0 1px 6px rgba(0,0,0,0.11)",
                          padding: "2px 8px",
                          marginLeft: 8,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src="/images/reitingstar-orange.png"
                          alt=""
                          style={{ width: 14, height: 14, marginRight: 5, verticalAlign: "middle" }}
                        />
                        {fmt1(hotel?.rating?.generalRating)}
                      </span>
                    </div>

                    <div style={{ fontWeight: 400, fontSize: 12, color: "#444" }}>
                      {hotel.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
