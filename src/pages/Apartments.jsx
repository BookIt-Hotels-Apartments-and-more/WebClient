import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../api/axios";
import BookingBannerForm from '../components/BookingBannerForm';
import HotelFilters from "../components/HotelFilters";
import Breadcrumbs from '../components/Breadcrumbs';
import { getUserFavorites  } from "../api/favoriteApi";
import countriesList from "../utils/countriesList";
import { ESTABLISHMENT_TYPE_LABELS } from "../utils/enums";
import { toggleApartmentFavorite } from "../utils/favoriteUtils";
import { ESTABLISHMENT_FEATURE_LABELS } from "../utils/enums";




export default function Apartments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [apartments, setApartments] = useState([]);
  const [filters, setFilters] = useState({
    country: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    // ... add other filters
  });
  const [selectedType, setSelectedType] = useState("All");
  const [showAuthMsg, setShowAuthMsg] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const countryOptions = countriesList.map(c => c.name);
  const [favorites, setFavorites] = useState([]);
  const [favoriteApartments, setFavoriteApartments] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const FACILITIES = Object.keys(ESTABLISHMENT_FEATURE_LABELS);

  useEffect(() => {
    axiosInstance.get("/api/apartments").then(res => setApartments(res.data));
    axiosInstance.get("/api/establishments").then(res => setEstablishments(res.data));
    if (user?.id) {
    getUserFavorites(user.id).then(setFavorites);
  }
  }, [user?.id]);

  // фільтрація по отелю
  const filteredEstablishments = useMemo(() => {
    return establishments.filter(est => {
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
    return apartments.filter(apt => {
      if (!allowedHotelIds.has(apt.establishment?.id)) return false;

      const price = typeof apt.price === "number" ? apt.price : null;
      const matchesMinPrice = !filters.minPrice || (price !== null && price >= Number(filters.minPrice));
      const matchesMaxPrice = !filters.maxPrice || (price !== null && price <= Number(filters.maxPrice));
      const matchesRating = !filters.rating || (apt.rating && apt.rating >= Number(filters.rating));
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



        {/* Filters by + кнопки категорії готелю */}
        <div className="d-flex align-items-center justify-content-between mb-3" style={{ width: "95%", marginTop: 30 }}>
          <div className="d-none d-md-flex align-items-center">
            <img
              src="/images/filter.png"
              alt="Filters icon"
              style={{ width: 40, height: 40, marginRight: 14 }}
            />
            <span className="fw-bold" style={{ color: '#16396A', fontSize: 26 }}>
              Filters by
            </span>
          </div>

          <div className="filter-types-wrapper mb-3" style={{ overflowX: "auto" }}>
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
                  
                    const isFavorite = favorites?.some(f => f.apartment && f.apartment.id === apt.id);

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
                            minHeight: 420,
                            height: "100%"
                        }}
                        >
                        {/* Фото */}
                        <div style={{
                            width: "100%",
                            position: "relative",
                            background: "#f8f9fa",
                            paddingTop: "66.66%",
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
                            onClick={() => toggleApartmentFavorite({
                                user,
                                favorites,
                                setFavorites,
                                apartmentId: apt.id,
                                setFavoriteApartments,
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
                        <div className="d-flex align-items-center justify-content-between px-3 pt-3 pb-1" style={{ minHeight: 32 }}>
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
                            <img src="/images/geoikon.png" alt="Geo-ikon"
                                style={{ width: 16, height: 16, marginRight: 6, objectFit: "contain" }} />
                            <span className="fw-bold" style={{ fontSize: 11, color: "#02457A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {
                                apt.establishment?.geolocation?.address
                                    ? apt.establishment.geolocation.address
                                    .split(",")
                                    .filter((_, i) => [0, 1, 3, 6].includes(i))
                                    .join(", ")
                                    : [apt.establishment?.geolocation?.city, apt.establishment?.geolocation?.country].filter(Boolean).join(", ")
                                }
                            </span>
                            </a>
                            <span className="d-flex align-items-center ms-2" style={{ color: "#FE7C2C", fontWeight: 700, fontSize: 15 }}>
                            <img src="/images/reitingstar-orange.png" alt="Star" style={{ width: 18, height: 18, marginRight: 4 }} />
                            {apt.rating?.generalRating ? apt.rating.generalRating.toFixed(1) : "0"}
                            </span>
                        </div>

                        {/* Назва готеля + назва номера */}
                        <div className="px-3" style={{ minHeight: 38 }}>
                            <div style={{ fontWeight: 600, fontSize: 16, color: "#001B48" }}>
                            {apt.establishment?.name}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 19, color: "#22614D" }}>
                            {apt.name}
                            </div>
                        </div>

                        {/* Вартість + More details */}
                        <div className="d-flex align-items-center justify-content-between px-3 pb-3 mt-auto" style={{ minHeight: 52 }}>
                            <div>
                            {typeof apt.price === "number" ? (
                                <>
                                <span style={{ fontWeight: 700, fontSize: 22, color: "#FE7C2C" }}>{apt.price} $</span>
                                <span style={{ fontWeight: 400, fontSize: 15, color: "#001B48", marginLeft: 3 }}>/ night</span>
                                </>
                            ) : (
                                <span style={{ color: "#001B48" }}>See prices</span>
                            )}
                            </div>
                            <Link
                            to={`/hotels/${apt.establishment?.id}`}
                            className="btn fw-bold px-4 py-2"
                            style={{ fontSize: 14, background: "#97CADB", color: "#001B48", borderRadius: "10px" }}
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
