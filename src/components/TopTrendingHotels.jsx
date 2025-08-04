import React, { useEffect, useState, useMemo } from "react";
import { getAllEstablishments } from "../api/establishmentsApi";
import { getAllBookings } from "../api/bookingApi";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axios";
import HotelCard from "../components/HotelCard ";
import { getUserFavorites, addFavorite, removeFavorite  } from "../api/favoriteApi";
import { toast } from 'react-toastify';
import { toggleHotelFavorite } from "../utils/favoriteUtils";


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

const TopTrendingHotels = ({ search = "" }) => {
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const navigate = useNavigate();
  const [apartments, setApartments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllEstablishments(),
      getAllBookings(),
      axiosInstance.get("/api/apartments"),
      userId ? getUserFavorites(userId) : Promise.resolve([]),
    ])
      .then(([hotelsData, bookingsData, apartmentsData, favoritesData]) => {
        setHotels(hotelsData);
        setBookings(bookingsData);
        setApartments(apartmentsData.data);
        setFavorites(favoritesData);
      })
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

  // Топові готелі за останні 30 днів
  const topHotels = useMemo(() => {
  if (!hotels.length) return [];

  const now = new Date();
  const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
  const bookingsCount = {};
  bookings.forEach(b => {
    const estId = b.apartment?.establishment?.id || b.establishment?.id;
    const created = b.createdAt ? new Date(b.createdAt) : null;
    if (estId && (!created || (now - created) < THIRTY_DAYS)) {
      bookingsCount[estId] = (bookingsCount[estId] || 0) + 1;
    }
  });

  let hotelsWithCount = hotels.map(hotel => ({
    ...hotel,
    bookingsCount: bookingsCount[hotel.id] || 0,
  }));

  // Фільтрація по країні
  if (selectedCountry && selectedCountry !== "All") {
    hotelsWithCount = hotelsWithCount.filter(h => h.geolocation?.country === selectedCountry);
  }

  hotelsWithCount.sort((a, b) => b.bookingsCount - a.bookingsCount);

  return hotelsWithCount; // <-- Всі топові, без slice!
}, [hotels, bookings, selectedCountry]);

const searchLower = (search || "").trim().toLowerCase();
const filteredTopHotels = topHotels.filter(hotel => {
  const country = (hotel.geolocation?.country || "").toLowerCase();
  const city = (hotel.geolocation?.city || "").toLowerCase();
  return (
    hotel.name.toLowerCase().includes(searchLower) ||
    country.includes(searchLower) ||
    city.includes(searchLower)
  );
});

const hotelsToShow =
  searchLower && filteredTopHotels.length === 0
    ? topHotels
    : filteredTopHotels;

const displayTopHotels = hotelsToShow.slice(0, 3);


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
              onClick={() => navigate("/hotels", {
                state: {
                  source: "TopTrendingHotels",
                  hotels: topHotels,
                  title: "Top Trending Hotels"
                }
              })}
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
                // Визначаємо apartmentId для фаворитів
                const hotelApartments = apartments.filter(a => a.establishment?.id === hotel.id);
                const apartmentId = hotelApartments[0]?.id;
                const prices = hotelApartments.map(a => a.price).filter(p => typeof p === "number" && !isNaN(p));
                let minPrice = null;
                if (prices.length > 0) {
                minPrice = Math.min(...prices);
                }
                // Перевірка, чи є вже у favorites
                const isFavorite = !!favorites.find(f => f.apartment && f.apartment.id === apartmentId);

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
                      hotel,
                      apartments,
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
