import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAllEstablishments } from "../api/establishmentsApi";
import { axiosInstance } from "../api/axios";
import BookingBannerForm from '../components/BookingBannerForm';
import HotelFilters from "../components/HotelFilters";
import countriesList from "../utils/countriesList";

export default function HotelsList() {
  const location = useLocation();
  const sourceHotels = location.state?.hotels || null;
  const hotelsTitle = location.state?.title || "All Hotels";

  const [search, setSearch] = useState("");
  const [hotels, setHotels] = useState([]);
  const [apartments, setApartments] = useState([]);
  const countryOptions = countriesList.map(c => c.name);
  const [filters, setFilters] = useState({
    country: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
  });

  // Завантажуємо повний список готелів (на випадок коли переходять без state)
  useEffect(() => {
    getAllEstablishments().then(setHotels);
    axiosInstance.get("/api/apartments").then(res => setApartments(res.data));
  }, []);

  // Вибираємо, з якими готелями працюємо — sourceHotels чи повний список
  const hotelsBase = useMemo(
    () => sourceHotels || hotels,
    [sourceHotels, hotels]
  );

  // Додаємо фільтрацію та пошук
  const filteredHotels = useMemo(() => {
    return hotelsBase.filter(hotel => {
      // Фільтр по країні
      const geo = hotel.Geolocation || {};
      const country = (geo.Country || "").trim().toLowerCase();
      const matchesCountry = !filters.country || country === filters.country.toLowerCase();

      // Мін/макс ціна
      const hotelApartments = apartments.filter(a => a.establishment?.id === hotel.id);
      const prices = hotelApartments.map(a => a.price).filter(p => typeof p === "number" && !isNaN(p));
      const price = prices.length > 0 ? Math.min(...prices) : null;
      const matchesMinPrice = !filters.minPrice || (price !== null && price >= Number(filters.minPrice));
      const matchesMaxPrice = !filters.maxPrice || (price !== null && price <= Number(filters.maxPrice));
      // Рейтинг
      const matchesRating = !filters.rating || (hotel.rating && hotel.rating >= Number(filters.rating));
      // Пошук (якщо ввели в BookingBannerForm)
      const searchLower = search.trim().toLowerCase();
      const matchesSearch = !searchLower ||
        hotel.name.toLowerCase().includes(searchLower) ||
        geo.City?.toLowerCase().includes(searchLower);

      return matchesCountry && matchesMinPrice && matchesMaxPrice && matchesRating && matchesSearch;
    });
  }, [hotelsBase, apartments, filters, search]);

  return (
    <div>
      {/* Банер */}
      <div className='baner'
        style={{
          width: '100%',
          maxWidth: '1955px',
          minHeight: '687px',
          backgroundImage: "url('/images/mainbaner.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          margin: '0 auto',
          marginTop: '-110px',
          marginBlockEnd: '-110px',
          zIndex: 1
        }}>
      </div>
      <BookingBannerForm search={search} setSearch={setSearch} />

      <div className="container py-5" style={{ width: 1800, maxWidth: "95vw" }}>
        <h2 className="fw-bold mb-3" style={{color: '#16396A'}}>
          {hotelsTitle}
        </h2>
        <h2 className="fw-bold mb-3 d-flex align-items-center" style={{color: '#16396A'}}>
          <img
            src="/images/filter.png"
            alt="Filters icon"
            style={{ width: 40, height: 40, marginRight: 14 }}
          />
          Filter hotels
        </h2>

        <div className="row">
          {/* Фільтр зліва */}
          <div className="col-12 col-md-3 mb-4">
            <HotelFilters
              filters={filters}
              setFilters={setFilters}
              countryOptions={countryOptions}
              showCountry={true}
            />
          </div>
          {/* Список готелів */}
          <div className="col-12 col-md-9">
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel) => {
                const hotelApartments = apartments.filter(a => a.establishment?.id === hotel.id);
                const prices = hotelApartments.map(a => a.price).filter(p => typeof p === "number" && !isNaN(p));
                let priceText = null;
                if (prices.length > 0) {
                  priceText = Math.min(...prices);
                }
                return (
                  <div className="col-12 mb-4" key={hotel.id}>
                    <div className="card flex-row h-100 shadow-sm" style={{ minHeight: 220, borderRadius: 12, overflow: 'hidden' }}>
                      <div className="d-flex align-items-center" style={{
                        minWidth: 220, minHeight: 220, maxHeight: 220, background: "#f8f9fa",
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
                                marginRight: 6,
                                verticalAlign: "middle",
                                objectFit: "contain"
                              }}
                            />
                            {hotel.rating?.toFixed(1) ?? '9.5'}
                          </span>
                        </div>
                        <div className="d-flex align-items-center mb-1">
                          <span className="fw-bold" style={{ fontSize: 12, color: "#02457A" }}>
                            {hotel.Geolocation?.Address}
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
    </div>
  );
}
