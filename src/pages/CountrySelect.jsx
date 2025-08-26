import { useState, useEffect, useMemo, useContext  } from "react";
import { useLocation, Link, useNavigate  } from "react-router-dom";
import { getAllEstablishments } from "../api/establishmentsApi";
import { axiosInstance } from "../api/axios";
import BookingBannerForm from '../components/BookingBannerForm';
import Breadcrumbs from '../components/Breadcrumbs';
import HotelFilters from "../components/HotelFilters";
import countriesList from "../utils/countriesList";
import { ESTABLISHMENT_TYPE_LABELS } from "../utils/enums";
import { getUserFavorites  } from "../api/favoriteApi";
import { isHotelFavorite, toggleHotelFavorite } from "../utils/favoriteUtils";
import { ESTABLISHMENT_FEATURE_LABELS, VIBE_TYPE } from "../utils/enums";


export default function CountrySelect() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedCountry = params.get("country");
  const [search, setSearch] = useState("");
  const [hotels, setHotels] = useState([]);
  const [apartments, setApartments] = useState([]);
  const countryOptions = countriesList.map(c => c.name);
  const [filters, setFilters] = useState({
    country: selectedCountry || "",
    minPrice: "",
    maxPrice: "",
    rating: "",
  });
  const [selectedVibe, setSelectedVibe] = useState(null);
  const vibeButtons = [
    { label: "Beach",     code: VIBE_TYPE.Beach },
    { label: "Nature",    code: VIBE_TYPE.Nature },
    { label: "City",      code: VIBE_TYPE.City },
    { label: "Mountains", code: VIBE_TYPE.Mountains },
    { label: "Relax",     code: VIBE_TYPE.Relax },
  ];
  const [selectedType, setSelectedType] = useState("All");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [showAuthMsg, setShowAuthMsg] = useState(false);  
  const currentCountry = filters.country || selectedCountry || "";
  const [favorites, setFavorites] = useState([]);
  const FACILITIES = Object.keys(ESTABLISHMENT_FEATURE_LABELS);
  const [sortMode, setSortMode] = useState("recommendations");



  useEffect(() => {
    getAllEstablishments()
      .then(setHotels)
      .catch(err => console.error("Error loading establishments:", err));

    axiosInstance.get("/api/apartments")
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        setApartments(list);
      })
      .catch(err => console.error("Error loading apartments:", err));

    if (user?.id) {
      getUserFavorites()
        .then(setFavorites)
        .catch(err => console.error("Error loading favorites:", err));
    }
  }, [user?.id]);


  const CONTENT_MAX = 1250;
  const H_PADDING   = 36; 

  // поки мокові дані
  const REGION_SUGGESTIONS = {
    Thailand: [
      { key: 'patong', title: 'Patong Beach', city: 'Patong',    badges: ['Beaches', 'Nightlife', 'Watersports'], img: '/images/patong.png' },
      { key: 'phi',    title: 'Phi Phi',       city: 'Phi Phi',   badges: ['Watersports', 'Beaches', 'Family Holiday'], img: '/images/phi.png' },
      { key: 'lanta',  title: 'Lanta Yai',     city: 'Lanta',     badges: ['Nature & Hiking', 'Beaches', 'Seafood'],   img: '/images/lanta.png' },
      { key: 'krabi',  title: 'Krabi',         city: 'Krabi',     badges: ['Cliffs', 'Longtail boats', 'Viewpoints'],  img: '/images/krabi.png' },
      { key: 'phuket', title: 'Phuket Town',   city: 'Phuket',    badges: ['Old town', 'Markets', 'Food'],             img: '/images/phuket.png' },
    ],
    _default: [
      { key: 'coast',  title: 'Sea Coast',     badges: ['Beaches', 'Seafood', 'Sunsets'], img: '/images/patong.png' },
      { key: 'old',    title: 'Old Town',      badges: ['Culture', 'Cafés', 'Walks'],     img: '/images/phi.png' },
      { key: 'mount',  title: 'Mountains',     badges: ['Trails', 'Views', 'Lakes'],      img: '/images/lanta.png' },
      { key: 'resort', title: 'Resort Area',   badges: ['Pools', 'SPA', 'Family'],        img: '/images/krabi.png' },
      { key: 'center', title: 'City Center',   badges: ['Museums', 'Food', 'Nightlife'],  img: '/images/phuket.png' },
    ],
  };

  const [regionIndex, setRegionIndex] = useState(0);
  const REGIONS_VISIBLE = 3;

  const regions = (REGION_SUGGESTIONS[currentCountry] || REGION_SUGGESTIONS._default);
  const visibleRegions = Array.from({ length: REGIONS_VISIBLE }, (_, i) => {
    const idx = (regionIndex + i) % regions.length;
    return regions[idx];
  });

  const handleRegionClick = (r) => {
    setSearch(r.city || r.title);
  };

  const nextRegion = () => setRegionIndex(i => (i + 1) % regions.length);

  
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      // Фільтр по країні
      const geo = hotel.geolocation || {};
      const country = (geo.country || "").trim().toLowerCase();
      const matchesCountry = !filters.country || country === filters.country.toLowerCase();


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
      
      // Пошук
      const searchLower = search.trim().toLowerCase();
      const matchesSearch = !searchLower ||
        hotel.name.toLowerCase().includes(searchLower) ||
        (geo.city || "").toLowerCase().includes(searchLower);

        // Фільтр по VIBE
      const hotelVibe = typeof hotel.vibe === "number" ? hotel.vibe : null;
      const matchesVibe = selectedVibe == null || hotelVibe === selectedVibe;
      
        // Фільтр по типу закладу
      const matchesType =
        selectedType === "All"
          ? true
          : hotel.type === Object.keys(ESTABLISHMENT_TYPE_LABELS).findIndex(label => label === selectedType);
      
      const hasAllFacilities = FACILITIES.every(fac => {
        if (!filters[fac]) return true;
        const key = fac.charAt(0).toLowerCase() + fac.slice(1);
        return hotel.features && hotel.features[key];
      });

      return (
        matchesCountry &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesRating &&
        matchesSearch &&
        matchesType &&
        matchesVibe &&
        hasAllFacilities 
      );
    });
  }, [hotels, apartments, filters, search, selectedType, selectedVibe]);

  // числовий рейтинг (з урахуванням 2 форматів)
  const getRating = (hotel) => {
    if (hotel?.rating?.generalRating != null) return Number(hotel.rating.generalRating);
    if (typeof hotel?.rating === "number") return Number(hotel.rating);
    return null;
  };

  // відсортований список для показу
  const sortedHotels = useMemo(() => {
    const copy = [...filteredHotels];
    if (sortMode === "recommendations") {
      copy.sort((a, b) => {
        const ra = getRating(a) ?? -1;
        const rb = getRating(b) ?? -1;
        if (rb !== ra) return rb - ra;

        const pa = Number(a.minApartmentPrice);
        const pb = Number(b.minApartmentPrice);
        if (pa == null && pb == null) return 0;
        if (pa == null) return 1;
        if (pb == null) return -1;
        return pa - pb;
      });
    }
    return copy;
  }, [filteredHotels, sortMode, apartments]);


  return (
    <div>
      {/* Банер */}
      <div
        className="baner"
        style={{
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
        }}
      >
        {/* Форма пошуку */}
        <div style={{ zIndex: 2, marginTop: -100 }}>
          <BookingBannerForm search={search} setSearch={setSearch} />
        </div>

        {/* Текст TRAVEL WITH US */}
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
            letterSpacing: "0",
            whiteSpace: "nowrap",
            zIndex: 3,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {currentCountry}
        </span>
      </div>

      <div className="container py-5" style={{ paddingTop: 40, paddingLeft: 0, paddingRight: 0, marginTop: 30 }}>
        {/* Заголовкова лінія: breadcrumbs + Vibe */}
        <div
          className="breadcrumbs"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            maxWidth: CONTENT_MAX,
            margin: "0 auto",
            padding: 0,
            marginTop: window.innerWidth < 768 ? "-30px" : "-50px",
            marginBottom: 30,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Breadcrumbs
            items={[
              { label: "Main page", to: "/" },
              { label: "Quick and easy planning >" },
              { label: currentCountry }
            ]}
          />

          {/* Кнопки Vibe */}
          <div style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 6 }}>
            {vibeButtons.map(({ label, code }) => (
              <button
                key={label}
                style={{
                  margin: "0 3px",
                  padding: "7px 18px",
                  background: selectedVibe === code ? "#1b3966" : "#fff",
                  color: selectedVibe === code ? "#fff" : "#1b3966",
                  border: "1px solid #1b3966",
                  borderRadius: "8px",
                  fontWeight: 300,
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "all 0.2s",
                }}
                onClick={() => setSelectedVibe(code)}
              >
                {label}
              </button>
            ))}
            <button
              style={{
                padding: "7px 18px",
                background: selectedVibe == null ? "#1b3966" : "#fff",
                color: selectedVibe == null ? "#fff" : "#1b3966",
                border: "1px solid #1b3966",
                borderRadius: "8px",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: 16,
              }}
              onClick={() => setSelectedVibe(null)}
            >
              All
            </button>
          </div>
        </div>
        
        {/* Лінія "Filters by" + кнопки типів */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: CONTENT_MAX,
            margin: "0 auto 30px",
            padding: 0,
            gap: 16,
          }}
        >
          <div className="d-none d-md-flex align-items-center">
            <img
              src="/images/filter.png"
              alt="Filters icon"
              style={{ width: 25, height: 25, marginRight: 14 }}
            />
            <span className="fw-bold" style={{ color: "#16396A", fontSize: 20 }}>
              Filters by
            </span>
          </div>

          {/* Кнопки типів */}
          <div className="filter-types-wrapper" style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", justifyContent: "flex-end"}}>
           <div className="d-flex flex-wrap gap-2 justify-content-end">
              {/* All */}
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
                  minWidth: 80,
                }}
                onClick={() => setSelectedType("All")}
              >
                All
              </button>

              {/* Решта типів */}
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
                    whiteSpace: "nowrap",
                    minWidth: 80,
                    transition: "all 0.2s",
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

          
          <div className="col-12 col-md-9">
            {/* === Region picker (добірка районів країни) === */}
            <div style={{ position: "relative", marginBottom: 18 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${REGIONS_VISIBLE}, 1fr)`,
                gap: 12,
                alignItems: "stretch",
              }}
            >
              {visibleRegions.map((r) => {
                const apts = Array.isArray(apartments) ? apartments : [];
                const dynamicCount = r.city
                  ? apts.filter(a => (a.establishment?.geolocation?.city || "").toLowerCase() === r.city.toLowerCase()).length
                  : 0;


                return (
                  <div
                    key={r.key}
                    onClick={() => handleRegionClick(r)}
                    style={{
                      cursor: "pointer",
                      borderRadius: 14,
                      background: "#fff",
                      boxShadow: "0 2px 10px rgba(2,69,122,0.08)",
                      padding: 10,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      minHeight: 110,
                    }}
                  >
                    <img
                      src={r.img}
                      alt={r.title}
                      style={{
                        width: 128,
                        height: 128,
                        objectFit: "cover",
                        borderRadius: 12,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "#1b3966", marginBottom: 6, marginBlockEnd: 15 }}>
                        {r.title}
                      </div>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#02457A", fontSize: 12, lineHeight: 1.2 }}>
                        {(r.badges || []).slice(0, 3).map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                      <div style={{ marginTop: 15, fontSize: 12, color: "#6b7b8a" }}>
                        {(dynamicCount || r.count) ? `${dynamicCount || r.count} Apartments` : '128 Apartaments'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Стрілка вправо — крок на 1 картку, по колу */}
            <button
              onClick={nextRegion}
              aria-label="Next"
              style={{
                position: "absolute",
                right: -6,
                top: "50%",
                transform: "translateY(-50%)",
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                background: "#97CADB",
                color: "#001B48",
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(2,69,122,0.18)",
                cursor: "pointer",
              }}
            >
              ›
            </button>
          </div>

          {/* Sort bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "22px 0 12px",
            }}
          >
            <button
              type="button"
              onClick={() => setSortMode("recommendations")}
              style={{
                border: "1px solid #97CADB",
                background: "#EAF6FB",
                color: "#02457A",
                borderRadius: 10,
                padding: "6px 12px",
                fontWeight: 600,
                fontSize: 12,
                boxShadow: "0 1px 3px rgba(2,69,122,0.08)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8
              }}
              title="Sort by rating (desc), then by price (asc)"
            >
              <span style={{ opacity: 0.8 }}>Sort:</span>
              <span>Our recommendations</span>
            </button>
          </div>


          <div>
            {/* Список готелів */}          
            {sortedHotels.length > 0 ? (
              sortedHotels.map((hotel) => {
                const apts = Array.isArray(apartments) ? apartments : [];
                const minPrice = Number.isFinite(Number(hotel?.minApartmentPrice))
                  ? Number(hotel.minApartmentPrice)
                  : null;
                const isFavorite = isHotelFavorite(favorites, hotel.id);
                const priceText = minPrice;
                const IMG_HEIGHT = window.innerWidth >= 768 ? 180 : 180;
                return (
                  <div className="col-12 mb-4" key={hotel.id}>
                    <div
                      className="hotel-card row g-0 align-items-stretch flex-md-row flex-column"
                      style={{
                        borderRadius: 10,
                        overflow: "hidden",
                        boxShadow: "0 0 3px 2px #9ad8ef",
                        background: "#fff",
                        margin: "0 auto",
                        maxWidth: 950,
                        height: 180, //  ЗМЕНЬШИТИ
                        width: "100%"
                      }}
                    >
                      {/* Фото готелю */}
                      <div className="col-md-5 col-12 d-flex align-items-stretch" style={{padding: 0}}>
                        <div style={{
                          width: "100%",
                          height: IMG_HEIGHT,
                          minHeight: IMG_HEIGHT,
                          maxHeight: IMG_HEIGHT,
                          position: "relative",
                          background: "#f8f9fa"
                        }}>
                          <img
                            src={hotel.photos?.[0]?.blobUrl || "/noimage.png"}
                            alt={hotel.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 10
                            }}
                          />
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
                              filter: isFavorite ? "none" : "grayscale(1)",
                            }}
                            onClick={() => {
                              toggleHotelFavorite({
                                user,
                                favorites,
                                setFavorites,
                                establishmentId: hotel.id,
                              });
                            }}
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
                      </div>
                      {/* Контент готелю */}
                      <div className="col-md-7 col-12 d-flex flex-column py-2 px-3" style={{background: "#fff", gap: 14 }}>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-bold" style={{ fontSize: 16, color: "#22614D" }}>{hotel.name}</span>
                          <span className="badge" style={{ fontSize: 14, color: "#FE7C2C" }}>
                            <img src="/images/reitingstar-orange.png" alt="Star"
                              style={{ width: 14, height: 14, marginRight: 6, verticalAlign: "middle", objectFit: "contain" }} />
                            {
                              hotel?.rating?.generalRating != null
                                ? Number(hotel.rating.generalRating).toFixed(1)
                                : (typeof hotel?.rating === "number" ? Number(hotel.rating).toFixed(1) : "—")
                            }
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.geolocation?.address || "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 13,
                              color: "#02457A",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <img src="/images/geoikon.png" alt="Geo-ikon"
                              style={{ width: 14, height: 14, marginRight: 6, objectFit: "contain" }} />
                            <span className="fw-bold" style={{ fontSize: 11, color: "#02457A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {hotel.geolocation?.address?.split(",")?.filter((_, i) => [0, 1, 3, 6].includes(i))?.join(", ")}
                            </span>
                          </a>
                        </div>
                        <div className="d-flex align-items-end justify-content-between" style={{ gap: 8 }}>
                          <div className="mb-1" style={{ fontSize: 12, minHeight: 40, maxWidth: 330, color: "#001B48", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {hotel.description}
                          </div>
                          <span className="fw-bold" style={{ color: "#001B48", fontSize: 14 }}>
                            {priceText ? (
                              <>
                                <span style={{ fontWeight: 700, fontSize: 18 }}>{priceText} $</span>
                                <span style={{ fontWeight: 400, fontSize: 14, marginLeft: 3 }}>/ night</span>
                              </>
                            ) : (
                              "See prices"
                            )}
                          </span>
                        </div>
                        <div className="d-flex align-items-end justify-content-between" style={{ gap: 8 }}>
                          {apartments.filter(a => a.establishment?.id === hotel.id)
                           .some(a => a.features?.breakfast) ? (
                            <span style={{ color: "#FE7C2C", fontWeight: 300, fontSize: 13 }}>Breakfast is included</span>
                          ) : (
                            <span style={{ color: "#FE7C2C", fontWeight: 300, fontSize: 13 }}>Breakfast is paid separately</span>
                          )}
                          <Link to={`/hotels/${hotel.id}`} className="btn fw-bold px-4 py-1"
                            style={{ fontSize: 13, background: "#97CADB", color: "#001B48", borderRadius: "10px" }}>
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
                  No hotels found in this country.
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
