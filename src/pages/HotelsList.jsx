import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAllEstablishments, getEstablishmentsByVibe, getTrendingEstablishments } from "../api/establishmentsApi";
import { axiosInstance } from "../api/axios";
import BookingBannerForm from '../components/BookingBannerForm';
import HotelFilters from "../components/HotelFilters";
import countriesList from "../utils/countriesList";
import { ESTABLISHMENT_FEATURE_LABELS } from "../utils/enums";
import { getAllReviews } from "../api/reviewApi";
import { isHotelFavorite, toggleHotelFavorite } from "../utils/favoriteUtils";

const fmt1 = v => (v != null && !Number.isNaN(Number(v)) ? Number(v).toFixed(1) : "—");
const fmt1Blank = v => (v != null && !Number.isNaN(Number(v)) ? Number(v).toFixed(1) : "");


export default function HotelsList() {
  const location = useLocation();
  const sourceHotels = location.state?.hotels || null;
  const params = new URLSearchParams(location.search);
  const selectedType = params.get("type");
  const vibeParam = params.get("vibe");
  const selectedVibe = vibeParam !== null ? Number(vibeParam) : null;
  const trendingFlag = params.get("trending");
  const trendingDays = Number(params.get("days") || 30);
  const hotelsTitle =
      (new URLSearchParams(location.search).get("trending") === "1")
        ? "Top trending hotels"
        : (location.state?.title || "All Hotels");

  const [search, setSearch] = useState("");
  const [hotels, setHotels] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const countryOptions = countriesList.map(c => c.name);
  const FACILITIES = Object.keys(ESTABLISHMENT_FEATURE_LABELS);
  const [filters, setFilters] = useState({
    country: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
  });
  const [reviews, setReviews] = useState([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [modalReviews, setModalReviews] = useState([]);
 

  useEffect(() => {
    if (trendingFlag === "1") {
      getTrendingEstablishments(100, trendingDays)
        .then(data => setHotels(Array.isArray(data) ? data : (data?.items ?? [])))
        .catch(() => setHotels([]));
    } else if (selectedVibe !== null && !Number.isNaN(selectedVibe)) {
      getEstablishmentsByVibe(selectedVibe)
        .then((res) => {
          const data = Array.isArray(res) ? res : (res?.items ?? []);
          setHotels(data);
        })
        .catch(() => setHotels([]));
    } else {
      getAllEstablishments().then(setHotels);
    }
      axiosInstance.get("/api/apartments").then(res => setApartments(res.data));
      
      if (userId) {
        try { setFavorites(JSON.parse(localStorage.getItem("favorites") || "[]")); }
        catch { setFavorites([]); }
      }
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

  }, [userId, selectedVibe, trendingFlag, trendingDays]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const all = await getAllReviews();          
        setReviews(all);
      } catch (e) {
        console.error("Error loading reviews:", e);
        setReviews([]);
      }
    };
    fetchReviews();
  }, [apartments]);

  const openApartmentReviews = (apartmentId) => {
    const list = reviews.filter(r => r.booking?.apartment?.id === apartmentId);
    setModalReviews(list);
    setShowReviewsModal(true);
  };
  
  const matchingCountries = useMemo(() => {
    if (!selectedType) return null;
    return countriesList
      .filter(c => c.types.includes(selectedType))
      .map(c => c.name.toLowerCase());
  }, [selectedType]);

  const hotelsBase = useMemo(
    () => sourceHotels || hotels,
    [sourceHotels, hotels]
  );

  const filteredHotels = useMemo(() => {
    return hotelsBase.filter(hotel => {
      // Фільтр по країні
      const geo = hotel.geolocation || {};
      const country = (geo.country || "").trim().toLowerCase();
      const matchesCountry = !filters.country || country === filters.country.toLowerCase();

      // Фільтр для QuickPlanning
      const matchesType = (selectedVibe !== null && !Number.isNaN(selectedVibe))
        ? true
        : (!matchingCountries || matchingCountries.includes(country));

      // Мін/макс ціна
      const price = Number.isFinite(Number(hotel?.minApartmentPrice))
        ? Number(hotel.minApartmentPrice)
        : null;
      const matchesMinPrice = !filters.minPrice || (price !== null && price >= Number(filters.minPrice));
      const matchesMaxPrice = !filters.maxPrice || (price !== null && price <= Number(filters.maxPrice));
      // Рейтинг
      const ratingRaw = filters?.rating ?? "";
      let minRating = null;
      if (ratingRaw !== "") {
        const parsed = Number(String(ratingRaw).replace("+", "").trim());
        if (Number.isFinite(parsed)) minRating = parsed;
      }
      const ratingNum =
        hotel?.rating?.generalRating != null
          ? Number(hotel.rating.generalRating)
          : (typeof hotel?.rating === "number" ? Number(hotel.rating) : null);
      const matchesRating = (minRating == null) || (ratingNum != null && ratingNum >= minRating);
      // Пошук (якщо ввели в BookingBannerForm)
      const searchLower = search.trim().toLowerCase();
      const matchesSearch = !searchLower ||
          (hotel.name || "").toLowerCase().includes(searchLower) ||
          (geo.city || "").toLowerCase().includes(searchLower);

      const hasAllFacilities = FACILITIES.every(fac => {
        if (!filters[fac]) return true;
        const key = fac.charAt(0).toLowerCase() + fac.slice(1);
        return hotel.features && hotel.features[key];
      });

      return matchesCountry && matchesType && matchesMinPrice && matchesMaxPrice && matchesRating && matchesSearch && hasAllFacilities;
    });
  }, [hotelsBase, apartments, filters, search, matchingCountries]);

  return (
    <div>
      {/* Банер */}
      <div className='baner'
        style={{
          width: "100%",
          maxWidth: "1955px",
          minHeight: "587px",
          backgroundImage: "url('/images/mainbaner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          margin: "0 auto",
          marginTop: "-110px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}>
          <div style={{ zIndex: 2, marginTop: -150 }}>
            <BookingBannerForm search={search} setSearch={setSearch} />
          </div>          
      </div>

      <div className="container py-5" style={{ width: 1800, maxWidth: "95vw" }}>
        <h2 className="fw-bold mb-3" style={{color: '#16396A'}}>
          {hotelsTitle}
        </h2>
        <div className="d-none d-md-flex align-items-center">
            <img
              src="/images/filter.png"
              alt="Filters icon"
              style={{ width: 40, height: 40, marginRight: 14, marginBlockEnd: 20 }}
            />
            <span className="fw-bold" style={{ color: '#16396A', fontSize: 26, marginBlockEnd: 20 }}>
              Filters hotel
            </span>
          </div>

        <div className="row">
        {/* Фільтр зліва */}
    
        {/* Mobile filter button */}
        <div className="d-block d-md-none mb-3">
          <button
            className="btn btn-outline-primary"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#filtersOffcanvas"
            aria-controls="filtersOffcanvas"
            style={{ fontWeight: 600 }}
          >
            <i className="bi bi-funnel"></i> Filters
          </button>
        </div>
        {/* Desktop фільтр */}
        <div className="col-12 col-md-3 mb-4 d-none d-md-block">
          <HotelFilters
            filters={filters}
            setFilters={newFilters => setFilters(newFilters)}
            countryOptions={countryOptions}
            showCountry={true}
          />
        </div>
        {/* Mobile offcanvas filters */}
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="filtersOffcanvas"
          aria-labelledby="filtersOffcanvasLabel"
        >
           <div className="offcanvas-header">
            <h5 id="filtersOffcanvasLabel">Filters</h5>
               <button
                 type="button"
                 className="btn-close"
                 data-bs-dismiss="offcanvas"
                 aria-label="Close"
               ></button>
             </div>
             <div className="offcanvas-body">
               <HotelFilters
                 filters={filters}
                 setFilters={newFilters => setFilters(newFilters)}
                 countryOptions={countryOptions}
                 showCountry={true}
               />
          </div>
        </div>

          
          {/* Список готелів */}
          <div className="col-12 col-md-9">
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel) => {
                const hotelApartments = apartments.filter(a => a.establishment?.id === hotel.id);
                const minPrice = Number.isFinite(Number(hotel?.minApartmentPrice))
                  ? Number(hotel.minApartmentPrice)
                  : null;
                const apartmentId =
                  hotelApartments.find(a => Number(a.price) === minPrice)?.id
                  ?? hotelApartments[0]?.id;
                const isFavorite = isHotelFavorite(favorites, hotel.id);
                const priceText = minPrice;

                return (
                  <div className="col-12 mb-4" key={hotel.id}>
                    <div className="card flex-row h-100 " style={{ minHeight: 220, borderRadius: 12, overflow: 'hidden', boxShadow: "0 0 3px 2px #9ad8ef" }}>
                      <div className="d-flex align-items-center" style={{
                        minWidth: 320, minHeight: 220, maxHeight: 220, background: "#f8f9fa",
                        position: "relative", overflow: "hidden"
                      }}>
                        <img
                          src={hotel.photos?.[0]?.blobUrl || "/noimage.png"}
                          alt={hotel.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            position: "absolute",
                            top: 0,
                            left: 0
                          }}
                        />
                        <button
                          style={{
                            position: "absolute", right: 16, top: 16,
                            background: "rgba(255,255,255,0.95)", borderRadius: "50%",
                            border: "none", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                            boxShadow: "0 0 12px #eee", color: "#BF9D78"
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const user = JSON.parse(localStorage.getItem("user"));
                            toggleHotelFavorite({
                              user,
                              favorites,
                              setFavorites,
                              establishmentId: hotel.id,
                            });
                          }}
                        >
                          <img src="/images/favorite.png" alt="favorite" style={{ width: 38, filter: isFavorite ? "none" : "grayscale(1)" }} />
                        </button>

                      </div>
                      <div className="card-body d-flex flex-column justify-content-between py-3 px-4" style={{ flex: 1 }}>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-bold" style={{ fontSize: 15, color: "#22614D" }}>{hotel.name}</span>
                          <span className="badge me-2" style={{ fontSize: 13, color: "#BF9D78" }}>
                            <img src="/images/reitingstar.png"
                              alt="Star"
                              style={{
                                width: 13,
                                height: 13,
                                marginRight: 4,
                                verticalAlign: "middle",
                                objectFit: "contain"
                              }}
                            />
                            {/* Середній рейтинг */}
                            {fmt1(hotel?.rating?.generalRating)}
                            {/* Кількість відгуків */}
                            <a
                              href="#reviews"
                              style={{
                                marginLeft: 10,
                                color: "#0074e4",
                                fontWeight: 300,
                                fontSize: 12,
                                textDecoration: "underline"
                              }}
                              onClick={e => {
                                e.preventDefault();
                                const list = reviews.filter(r => r.booking?.apartment?.establishment?.id === hotel.id);
                                setModalReviews(list);
                                setShowReviewsModal(true);
                              }}
                            >
                              {hotel.rating?.reviewCount ?? 0} reviews
                            </a>
                          </span>

                        </div>
                        <div className="d-flex align-items-center mb-1">
                          <span className="fw-bold" style={{ fontSize: 12, color: "#02457A" }}>
                            {hotel.geolocation?.address
                              ?.split(",")
                              ?.filter((_, i) => [0, 1, 3, 6].includes(i)) // 0 - номер, 1 - вулиця, 3 - місто, 6 - країна
                              ?.join(", ")}
                          </span>
                        </div>
                        <div className="mb-2" style={{ fontSize: 12, minHeight: 46 }}>{hotel.description}</div>
                        <div className="d-flex align-items-end justify-content-between">
                          <span className="fw-bold" style={{ color: "#001B48", fontSize: 12 }}>
                            {priceText ? (
                              <>
                                from <span style={{ fontWeight: 700, fontSize: 16 }}>{priceText} $</span>
                                <span style={{ fontWeight: 400, fontSize: 14, marginLeft: 3 }}>/ night</span>
                              </>
                            ) : (
                              "See prices"
                            )}
                          </span>
                          <Link to={`/hotels/${hotel.id}`} className="btn fw-bold px-4 py-2" style={{ fontSize: 12, background: "#FE7C2C", color: "#000000", borderRadius: "10px" }}>
                            More Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12">
                <p className="text-center text-muted">
                  No hotels found.
                </p>
              </div>
            )}
          </div>
        </div>        
      </div>

      {/* модалка виводу відгуку */}
      {showReviewsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(36,67,96,0.24)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowReviewsModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              minWidth: 380,
              maxWidth: 550,
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "34px 28px 24px 28px",
              boxShadow: "0 12px 48px #446e958f",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="btn btn-outline-secondary btn-sm"
              style={{ position: "absolute", right: 16, top: 12, borderRadius: 8, fontWeight: 600 }}
              onClick={() => setShowReviewsModal(false)}
            >×</button>
            <h5 style={{ fontWeight: 700, marginBottom: 16 }}>Reviews</h5>
            {modalReviews.length === 0 && <div className="text-muted">No reviews yet.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {modalReviews.map((r, i) => (
                <div key={r.id || i} style={{
                  borderBottom: "1px solid #eee",
                  paddingBottom: 10,
                  marginBottom: 8
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    {r.booking?.customer?.username || "Anonymous"}
                    <span style={{ marginLeft: 10, color: "#FE7C2C" }}>
                      {fmt1Blank(r?.rating)}
                    </span>
                  </div>
                  <div style={{ fontSize: 15 }}>{r.text}</div>
                  {Array.isArray(r.photos) && r.photos.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      {r.photos.map((photo, idx) => (
                        <img
                          key={photo.id || idx}
                          src={photo.blobUrl || "/noimage.png"}
                          alt=""
                          style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 7, border: "1px solid #ddd" }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
