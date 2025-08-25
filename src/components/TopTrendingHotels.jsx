import React, { useEffect, useState, useMemo } from "react";
import { getTrendingEstablishments } from "../api/establishmentsApi";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axios";
import HotelCard from "./HotelCard ";
import { getUserFavorites } from "../api/favoriteApi";
import { isHotelFavorite, toggleHotelFavorite } from "../utils/favoriteUtils";


const TopTrendingHotels = ({ search = "" }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const navigate = useNavigate();
  const [apartments, setApartments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    setLoading(true);
    Promise.all([ getTrendingEstablishments(12, 30),
      userId ? getUserFavorites() : Promise.resolve([]) ])
      .then(([trendingData, favoritesData]) => {
        const list = Array.isArray(trendingData) ? trendingData : trendingData?.items || [];
        setHotels(list);
        setFavorites(favoritesData);
      })
      .catch(err => console.error("Download error:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  // Унікальні країни з готелів
  const countries = useMemo(() => {
    const set = new Set();
    hotels.forEach(h => {
      if (h.geolocation?.country) set.add(h.geolocation.country);
    });
    return ["All", ...Array.from(set)];
  }, [hotels]);

  const searchLower = (search || "").trim().toLowerCase();

  const topHotels = useMemo(() => {
      let list = hotels;
      if (selectedCountry !== "All") {
        list = list.filter(h => h.geolocation?.country === selectedCountry);
      }
      if (searchLower) {
        list = list.filter(h => {
          const country = (h.geolocation?.country || "").toLowerCase();
          const city = (h.geolocation?.city || "").toLowerCase();
          return (
            (h.name || "").toLowerCase().includes(searchLower) ||
            country.includes(searchLower) ||
            city.includes(searchLower)
          );
        });
      }
      return list;
    }, [hotels, selectedCountry, searchLower]);

  const displayTopHotels = topHotels.slice(0, 3);

  if (loading) {
    return (
      <section className="my-5">
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          Loading trending hotels...
        </div>
      </section>
    );
  }

  if (topHotels.length === 0) {
    return (
      <section className="my-5">
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          No trending hotels found.
        </div>
      </section>
    );
  }

  return (
    <section className="my-5">
      <div style={{ maxWidth: 1200, margin: "0 auto", marginTop: 80 }}>
        {/* Header */}
        <div className="d-flex align-items-end justify-content-between mb-3 flex-wrap">
          <div>
            <h2 className="fw-bold mb-0" style={{ fontSize: 24, color: "#1b3966" }}>Top trending hotel in world</h2>
          </div>

          <button
              className="btn btn-link fw-bold"
              style={{ color: "#1b3966", fontSize: 15, textDecoration: "none" }}
              onClick={() => navigate("/hotels?trending=1&days=30")}
          >
            See all →
          </button>

        </div>
        {/* Buttons */}
        <div className="mb-3" style={{ display: "flex", gap: 12 }}>
          {countries.map(country => (
            <button
              key={country}
              className={`btn btn-sm ${selectedCountry === country ? "btn-primary" : "btn-outline-secondary"}`}
              style={{
                borderRadius: 18,
                fontWeight: 600,
                padding: "7px 22px",
                fontSize: 15,
                background: selectedCountry === country ? "#97CADB" : "transparent",
                color: selectedCountry === country ? "#1b3966" : "#1b3966",
                border: selectedCountry === country ? "1.5px solid #97CADB" : "1.5px solid #ddd",
                transition: "all 0.2s"
              }}
              onClick={() => setSelectedCountry(country)}
            >
              {country}
            </button>
          ))}
        </div>
        <div
            style={{
                display: "grid",
                gap: 32,
                gridTemplateColumns: "1fr 1fr 1fr",
                minHeight: 290,
            }}
            >
            {displayTopHotels.map((hotel) => {
              const minPrice = Number.isFinite(Number(hotel.minApartmentPrice)) ? Number(hotel.minApartmentPrice) : null;
              const isFavorite = isHotelFavorite(favorites, hotel.id);

                return (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  minPrice={minPrice}
                  isFavorite={isFavorite}
                  onToggleFavorite={() => {
                    const user = JSON.parse(localStorage.getItem("user"));
                    toggleHotelFavorite({
                      user,
                      favorites,
                      setFavorites,
                      establishmentId: hotel.id,
                    });
                  }}
                  showLimitedOffer={true}
                />
                );
            })}
            </div>
      </div>
    </section>
  );
};

export default TopTrendingHotels;
