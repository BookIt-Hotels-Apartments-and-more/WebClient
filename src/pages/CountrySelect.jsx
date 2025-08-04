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
import { toggleHotelFavorite } from "../utils/favoriteUtils";


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
  const filtersList = ["Beach", "Nature", "City", "Mountains", "Relax"];
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [showAuthMsg, setShowAuthMsg] = useState(false);  
  const currentCountry = filters.country || selectedCountry || "";
  const [favorites, setFavorites] = useState([]);



  useEffect(() => {
    getAllEstablishments().then(setHotels);
    axiosInstance.get("/api/apartments").then(res => setApartments(res.data));
    if (user?.id) {
    getUserFavorites(user.id).then(setFavorites);
  }
  }, [user?.id]);
  
  let hotelsToShow = hotels;

  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      // Фільтр по країні
      const geo = hotel.geolocation || {};
      const country = (geo.country || "").trim().toLowerCase();
      const matchesCountry = !filters.country || country === filters.country.toLowerCase();


      // Мін/макс ціна
      const hotelApartments = apartments.filter(a => a.establishment?.id === hotel.id);
      const prices = hotelApartments.map(a => a.price).filter(p => typeof p === "number" && !isNaN(p));
      const price = prices.length > 0 ? Math.min(...prices) : null;
      const matchesMinPrice = !filters.minPrice || (price !== null && price >= Number(filters.minPrice));
      const matchesMaxPrice = !filters.maxPrice || (price !== null && price <= Number(filters.maxPrice));
      
      // Рейтинг
      const matchesRating = !filters.rating || (hotel.rating && hotel.rating >= Number(filters.rating));
      
      // Пошук
      const searchLower = search.trim().toLowerCase();
      const matchesSearch = !searchLower ||
        hotel.name.toLowerCase().includes(searchLower) ||
        (geo.city || "").toLowerCase().includes(searchLower);

      // Фільтр по типу закладу
      const matchesType =
        selectedType === "All"
          ? true
          : hotel.type === Object.keys(ESTABLISHMENT_TYPE_LABELS).findIndex(label => label === selectedType);

      return (
        matchesCountry &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesRating &&
        matchesSearch &&
        matchesType
      );
    });
  }, [hotels, apartments, filters, search, selectedType]);


  if (selectedFilter !== "All") {
  hotelsToShow = hotelsToShow.filter(hotel =>
    Array.isArray(hotel.types) && hotel.types.includes(selectedFilter)
  );
}

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

      <div className="container py-5" style={{ width: 2800}}>
        <div className="breadcrumbs"
          style={{
             display: "flex",
            flexDirection: window.innerWidth < 768 ? "column" : "row",
            alignItems: window.innerWidth < 768 ? "flex-start" : "center",
            padding: window.innerWidth < 768 ? "0 8px" : "0 24px",
            marginTop: window.innerWidth < 768 ? "-30px" : "-50px",
            gap: window.innerWidth < 768 ? 12 : 0,
            maxWidth: 1300,
            margin: "0px auto 0 auto",
            marginBlockEnd: "30px",
            flexWrap: "wrap"
          }}>
          <Breadcrumbs
            items={[
              { label: "Main page", to: "/" },
              { label: "Quick and easy planning >" },
              { label: currentCountry }
            ]}
          />

          {/* блок з кнопками */}
          <div style={{ margin: "10px 20px" }}>
            {filtersList.map((f) => (
              <button
                key={f}
                style={{
                  margin: "0 3px",
                  padding: "7px 18px",
                  background: selectedFilter === f ? "#1b3966" : "#fff",
                  color: selectedFilter === f ? "#fff" : "#1b3966",
                  border: "1px solid #1b3966",
                  borderRadius: "8px",
                  fontWeight: 300,
                  cursor: "pointer",
                  fontSize: 13,
                  transition: "all 0.2s",
                }}
                onClick={() => setSelectedFilter(f)}
              >
                {f}
              </button>
            ))}
            <button
              style={{
                margin: "0 8px",
                padding: "7px 18px",
                background: selectedFilter === "All" ? "#1b3966" : "#fff",
                color: selectedFilter === "All" ? "#fff" : "#1b3966",
                border: "1px solid #1b3966",
                borderRadius: "8px",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: 16,
              }}
              onClick={() => setSelectedFilter("All")}
            >
              All
            </button>
          </div>
        </div>

        
        {/* Filters by + кнопки категорії готелю */}
        <div className="d-flex align-items-center justify-content-between mb-3" style={{ width: "95%" }}>
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


          {/* Список готелів */}
          <div className="col-12 col-md-8" style={{ marginLeft: 50 }}>
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel) => {
                const hotelApartments = apartments.filter(a => a.establishment?.id === hotel.id);
                const apartmentId = hotelApartments[0]?.id;
                const isFavorite = !!favorites.find(f => f.apartment && f.apartment.id === apartmentId);
                const prices = hotelApartments.map(a => a.price).filter(p => typeof p === "number" && !isNaN(p));
                let priceText = null;
                if (prices.length > 0) {
                  priceText = Math.min(...prices);
                }
                return (
                  <div className="col-12 mb-4" key={hotel.id}>
                    <div
                      className="hotel-card row g-0 align-items-stretch flex-md-row flex-column"
                      style={{
                        borderRadius: 16,
                        overflow: "hidden",
                        boxShadow: "0 0 3px 2px #9ad8ef",
                        background: "#fff",
                        margin: "0 auto",
                        maxWidth: 950,
                        minHeight: 220,
                        width: "100%"
                      }}
                    >
                      {/* Фото готелю */}
                      <div className="col-md-4 col-12 d-flex align-items-stretch" style={{padding: 0}}>
                        <div style={{
                          width: "100%",
                          height: "100%",
                          minHeight: 180,
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
                              borderRadius: 16,
                              minHeight: 180,
                              maxHeight: 250
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
                                hotel,
                                apartments,
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
                      <div className="col-md-8 col-12 d-flex flex-column justify-content-between py-3 px-4" style={{background: "#fff"}}>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-bold" style={{ fontSize: 17, color: "#22614D" }}>{hotel.name}</span>
                          <span className="badge" style={{ fontSize: 14, color: "#FE7C2C" }}>
                            <img src="/images/reitingstar-orange.png" alt="Star"
                              style={{ width: 14, height: 14, marginRight: 6, verticalAlign: "middle", objectFit: "contain" }} />
                            {hotel.rating?.reviewCount || 0}
                          </span>
                        </div>
                        <div className="d-flex align-items-center mb-1">
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
                              style={{ width: 16, height: 16, marginRight: 6, objectFit: "contain" }} />
                            <span className="fw-bold" style={{ fontSize: 11, color: "#02457A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {hotel.geolocation?.address?.split(",")?.filter((_, i) => [0, 1, 3, 6].includes(i))?.join(", ")}
                            </span>
                          </a>
                        </div>
                        <div className="d-flex align-items-end justify-content-between" style={{ gap: 10 }}>
                          <div className="mb-2" style={{ fontSize: 12, minHeight: 46, maxWidth: 330, overflow: "hidden", textOverflow: "ellipsis" }}>
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
                        <div className="d-flex align-items-end justify-content-between" style={{ gap: 10 }}>
                          {hotelApartments.some(a => a.features?.breakfast) ? (
                            <span style={{ color: "#FE7C2C", fontWeight: 300, fontSize: 13 }}>Breakfast is included</span>
                          ) : (
                            <span style={{ color: "#FE7C2C", fontWeight: 300, fontSize: 13 }}>Breakfast is paid separately</span>
                          )}
                          <Link to={`/hotels/${hotel.id}`} className="btn fw-bold px-4 py-2"
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
  );
}
