import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import BookingBannerForm from '../components/BookingBannerForm';
import HotelFilters from "../components/HotelFilters";
import Breadcrumbs from '../components/Breadcrumbs';
import countriesList from "../utils/countriesList";
import { ESTABLISHMENT_TYPE_LABELS } from "../utils/enums";
import { ESTABLISHMENT_FEATURE_LABELS } from "../utils/enums";
import { fetchApartments } from "../api/apartmentApi";
import { getAllEstablishments } from "../api/establishmentsApi";
import { getUserFavorites } from "../api/favoriteApi";
import { isHotelFavorite, toggleHotelFavorite } from "../utils/favoriteUtils";


const fmt1 = v => (v != null && !Number.isNaN(Number(v)) ? Number(v).toFixed(1) : "—");

export default function Apartments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [apartments, setApartments] = useState([]);
  const [filters, setFilters] = useState({
    country: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
  });
  const [selectedType, setSelectedType] = useState("All");
  const [showAuthMsg, setShowAuthMsg] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const countryOptions = countriesList.map(c => c.name);
  const [favorites, setFavorites] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const FACILITIES = Object.keys(ESTABLISHMENT_FEATURE_LABELS);
  const [favoriteEstablishments, setFavoriteEstablishments] = useState([]);

  useEffect(() => {
    fetchApartments()
      .then(setApartments)
      .catch(err => console.error("Load apartments error:", err));

    getAllEstablishments()
      .then(setEstablishments)
      .catch(err => console.error("Load establishments error:", err));

    if (user?.id) {
      getUserFavorites()
        .then(setFavorites)
        .catch(err => console.error("Load favorites error:", err));
    }
  }, [user?.id]);


  // фільтрація по отелю
  const filteredEstablishments = useMemo(() => {
    const list = Array.isArray(establishments) ? establishments : [];
    return list.filter(est => {
      const geo = est.geolocation || {};
      const country = (geo.country || "").trim().toLowerCase();

      const matchesCountry = !filters.country || country === filters.country.toLowerCase();
      const isAllOrApartment = selectedType === "All" || selectedType === "Apartment";
      const matchesType = isAllOrApartment || est.type === ESTABLISHMENT_TYPE_LABELS[selectedType];

      const hasAllFacilities = FACILITIES.every(fac => {
        if (!filters[fac]) return true;
        const key = fac.charAt(0).toLowerCase() + fac.slice(1);
        return est.features && est.features[key];
      });

      return matchesCountry && matchesType && hasAllFacilities;
    });
  }, [establishments, filters, selectedType]);

  
  const allowedHotelIds = useMemo(
    () => new Set(filteredEstablishments.map(est => est.id)),
    [filteredEstablishments]
  );

  // фільтрація по номерам
  const filteredApartments = useMemo(() => {
    const apts = Array.isArray(apartments) ? apartments : [];
    return apts.filter(apt => {
      if (!allowedHotelIds.has(apt.establishment?.id)) return false;

      const price = typeof apt.price === "number" ? apt.price : null;
      const matchesMinPrice = !filters.minPrice || (price !== null && price >= Number(filters.minPrice));
      const matchesMaxPrice = !filters.maxPrice || (price !== null && price <= Number(filters.maxPrice));
      const ratingRaw = filters?.rating ?? "";
      let minRating = null;
      if (ratingRaw !== "") {
        const parsed = Number(String(ratingRaw).replace("+", "").trim());
        if (Number.isFinite(parsed)) minRating = parsed;
      }
      const ratingNum =
        apt?.rating?.generalRating != null
          ? Number(apt.rating.generalRating)
          : (typeof apt?.rating === "number" ? Number(apt.rating) : null);

      const matchesRating = (minRating == null) || (ratingNum != null && ratingNum >= minRating);
      const searchLower = search.trim().toLowerCase();
      const geo = apt.establishment?.geolocation || {};
      const matchesSearch = !searchLower ||
        apt.name?.toLowerCase().includes(searchLower) ||
        (geo.city || "").toLowerCase().includes(searchLower) ||
        (geo.country || "").toLowerCase().includes(searchLower) ||
        (apt.establishment?.name || "").toLowerCase().includes(searchLower);

      return matchesMinPrice && matchesMaxPrice && matchesRating && matchesSearch;
    });
  }, [apartments, allowedHotelIds, filters, search]);

  

  return (
    <div>
      {/* Banner з формою пошуку */}
      <div className="baner" style={{
        width: "100%",
        maxWidth: "1955px",
        minHeight: "587px",
        backgroundImage: "url('/images/homebaner.png')",
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
        <div style={{ zIndex: 2, marginTop: -100 }}>
          <BookingBannerForm search={search} setSearch={setSearch} />
        </div>
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: 56,
            transform: "translateX(-50%)",
            fontFamily: "'Sora', Arial, sans-serif",
            fontWeight: 700,
            fontSize: 130,
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: "2px #fff",
            textStroke: "2px #fff",
            whiteSpace: "nowrap",
            zIndex: 3,
            pointerEvents: "none",
            userSelect: "none",
          }}>
          TRAVEL WITH US
        </span>
      </div>      
        
      <div className="container py-5" style={{ width: 2200 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Main page", to: "/" },
            { label: "Apartments" },
          ]}
        />



        {/* Filters by + типи*/}
        <div className="row align-items-center mb-3" style={{ marginTop: 30 }}>
          {/* Ліва колонка під сайдбар фільтрів */}
          <div className="col-12 col-md-3 d-none d-md-flex align-items-center">
            <img
              src="/images/filter.png"
              alt="Filters icon"
              style={{ width: 40, height: 40, marginRight: 14 }}
            />
            <span className="fw-bold" style={{ color: '#16396A', fontSize: 26 }}>
              Filters by
            </span>
          </div>

          {/* Права колонка під список */}
          <div className="col-12 col-md-9">
            <div className="filter-types-wrapper d-flex justify-content-md-end justify-content-start overflow-auto pb-2">
              <div className="d-flex flex-nowrap gap-2">
                <button
                  className="btn"
                  style={{
                    background: selectedType === "All" ? "#FE7C2C" : "#fff",
                    color: selectedType === "All" ? "#fff" : "#1b3966",
                    border: "1px solid #1b3966",
                    borderRadius: "8px",
                    fontWeight: 500,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    minWidth: 80
                  }}
                  onClick={() => setSelectedType("All")}
                >
                  All
                </button>

                {Object.keys(ESTABLISHMENT_TYPE_LABELS).map((type) => (
                  <button
                    key={type}
                    className="btn"
                    style={{
                      background: selectedType === type ? "#FE7C2C" : "#fff",
                      color: selectedType === type ? "#fff" : "#1b3966",
                      border: "1px solid #1b3966",
                      borderRadius: "8px",
                      fontWeight: 500,
                      fontSize: 12,
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                      minWidth: 80
                    }}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
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
                    setFilters={newFilters => {
                        setFilters(newFilters);                        
                    }}
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
                        setFilters={newFilters => {
                        setFilters(newFilters);
                        if (newFilters.country !== filters.country) {
                            navigate(`/country-select?country=${encodeURIComponent(newFilters.country)}`);
                        }
                        }}
                        countryOptions={countryOptions}
                        showCountry={true}
                    />
                    </div>
                </div>


            {/* Список апартаментів */}
            <div className="col-12 col-md-9">
            <div className="row">
                {filteredApartments.length > 0 ? (
                filteredApartments.map(apt => {
                  
                    const isFavorite = isHotelFavorite(favorites, apt.establishment?.id);

                    return (
                    <div className="col-12 col-md-4 mb-4 d-flex" key={apt.id}>
                        <div
                        className="hotel-card d-flex flex-column justify-content-between"
                        style={{
                            borderRadius: 16,
                            overflow: "hidden",
                            boxShadow: "0 0 3px 2px #9ad8ef",
                            background: "#fff",
                            width: "100%",
                            minHeight: 230,
                        }}
                        >
                        {/* Фото */}
                        <div style={{
                            width: "100%",
                            position: "relative",
                            background: "#f8f9fa",
                            paddingTop: "70%",
                            overflow: "hidden",
                        }}>
                            <img
                            src={apt.photos?.[0]?.blobUrl || "/noimage.png"}
                            alt={apt.name}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                            />
                            {/* Обране */}
                            <img
                            src="/images/favorite.png"
                            alt="Add to favorite"
                            style={{
                                position: "absolute",
                                top: 14,
                                right: 14,
                                width: 32,
                                height: 32,
                                cursor: "pointer",
                                background: "#fff",
                                borderRadius: "50%",
                                padding: 5,
                                boxShadow: "0 0 5px #ccc",
                                zIndex: 2,
                                filter: isFavorite ? "none" : "grayscale(1)"
                            }}
                            onClick={() => toggleHotelFavorite({
                              user,
                              favorites,
                              setFavorites,
                              establishmentId: apt.establishment?.id,
                              setFavoriteEstablishments,
                            })}
                            />
                            {showAuthMsg && (
                            <div
                                style={{
                                position: "absolute",
                                top: 14,
                                right: 60,
                                background: "#fff",
                                color: "#FE7C2C",
                                border: "1px solid #FE7C2C",
                                borderRadius: 8,
                                padding: "4px 14px",
                                fontSize: 13,
                                zIndex: 3,
                                minWidth: 170,
                                textAlign: "center",
                                }}
                            >
                                Only an authorized user can add to favorites.
                            </div>
                            )}
                        </div>

                        {/* Місто + країна + рейтинг */}
                        <div className="d-flex align-items-center justify-content-between px-3 pt-2 pb-1" style={{ minHeight: 24 }}>
                            <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apt.establishment?.geolocation?.address || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: 13,
                                color: "#02457A",
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                maxWidth: "75%",
                                flex: 1,
                                overflow: "hidden"
                            }}
                            >
                            
                            <span className="fw-bold" style={{ fontSize: 11, color: "#FE7C2C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {
                                  [
                                    apt?.establishment?.geolocation?.city,
                                    apt?.establishment?.geolocation?.country
                                  ].filter(Boolean).join(", ")
                                }
                            </span>
                            </a>
                            <span className="d-flex align-items-center ms-2" style={{ color: "#FE7C2C", fontWeight: 700, fontSize: 15 }}>
                            <img src="/images/reitingstar-orange.png" alt="Star" style={{ width: 18, height: 18, marginRight: 4 }} />
                            {fmt1(apt?.rating?.generalRating)}
                            </span>
                        </div>

                        {/* Назва готеля */}
                        <div className="px-3" style={{ minHeight: 24 }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#001B48" }}>
                            {apt.establishment?.name}
                            </div>
                        </div>

                        {/* Вартість + More details */}
                        <div className="d-flex align-items-center justify-content-between px-3 pb-2 mt-auto" style={{ minHeight: 38 }}>
                            <div>
                            {typeof apt.price === "number" ? (
                                <>
                                <span style={{ fontWeight: 700, fontSize: 14, color: "#001B48" }}>{apt.price} $</span>
                                <span style={{ fontWeight: 400, fontSize: 13, color: "#001B48", marginLeft: 3 }}>/ night</span>
                                </>
                            ) : (
                                <span style={{ color: "#001B48" }}>See prices</span>
                            )}
                            </div>
                            <Link
                            to={`/hotels/${apt.establishment?.id}`}
                            className="btn fw-bold px-3 py-1"
                            style={{ fontSize: 12, background: "#97CADB", color: "#001B48", borderRadius: "10px" }}
                            >
                            More details
                            </Link>
                        </div>
                        </div>
                    </div>
                    )
                })
                ) : (
                <div className="col-12">
                    <p className="text-center text-muted">
                    No apartments found.
                    </p>
                </div>
                )}
            </div>
            </div>

        </div>
      </div>
    </div>
  );
}
