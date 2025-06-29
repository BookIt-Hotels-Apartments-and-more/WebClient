import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllEstablishments } from "../api/establishmentsApi";
import { axiosInstance } from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useMemo } from "react";

const Home = () => {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [hotels, setHotels] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllEstablishments();
        //console.log("📦 All hotels from backend:", data);
        setHotels(data);
      } catch (err) {
        console.error("❌ Помилка при завантаженні готелів:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    getAllEstablishments().then(setHotels);
    axiosInstance.get("/api/apartments").then(res => setApartments(res.data));
  }, []);

  const hotelsWithPrice = useMemo(() => {
      return hotels.map(hotel => {
        const hotelApartments = apartments.filter(a => a.establishment?.id === hotel.id);
        const prices = hotelApartments.map(a => a.price).filter(p => typeof p === "number" && !isNaN(p));
        let price = null;
        if (prices.length > 0) {
          price = Math.min(...prices);
        }
        return { ...hotel, price }; // додаємо price до об'єкту hotel
      });
    }, [hotels, apartments]);

  const filteredHotels = hotelsWithPrice.filter((hotel) => {
      const matchSearch =
        hotel.name.toLowerCase().includes(search.toLowerCase()) ||
        hotel.address.toLowerCase().includes(search.toLowerCase());

      const matchMin = minPrice === "" || hotel.price >= parseInt(minPrice) || hotel.price == null;
      const matchMax = maxPrice === "" || hotel.price <= parseInt(maxPrice) || hotel.price == null;

      return matchSearch && matchMin && matchMax;
    });

    const sortedHotels = [...filteredHotels].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  return (
  <div className="container py-5">
    <h1 className="mb-4 fw-bold">Find the best hotels</h1>

    {/* 🔍 Пошук та фільтрація */}
    <div className="row mb-4">
      <div className="col-md-3 mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="col-md-2 mb-2">
        <input
          type="number"
          className="form-control"
          placeholder="Min. price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
      </div>
      <div className="col-md-2 mb-2">
        <input
          type="number"
          className="form-control"
          placeholder="Max. price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <div className="col-md-3 mb-2 d-flex gap-1 align-items-center">
        <DatePicker
          selected={checkIn}
          onChange={date => {
            setCheckIn(date);
            if (checkOut && date && date >= checkOut) setCheckOut(null);
          }}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={new Date()}
          dateFormat="dd.MM.yyyy"
          placeholderText="Check-in"
          className="form-control"
        />
        <span>—</span>
        <DatePicker
          selected={checkOut}
          onChange={date => setCheckOut(date)}
          selectsEnd
          startDate={checkIn}
          endDate={checkOut}
          minDate={checkIn || new Date()}
          dateFormat="dd.MM.yyyy"
          placeholderText="Departure"
          className="form-control"
          disabled={!checkIn}
        />
      </div>
      <div className="col-md-2 mb-2 d-flex align-items-center">
        <button className="btn btn-outline-primary w-100" style={{whiteSpace: 'nowrap', minWidth: 100}}>
          🔍 Search
        </button>
      </div>
    </div>

    {/* 🏨 Вивід готелів */}
    <div className="row">
      {sortedHotels.length > 0 ? (
        sortedHotels.map((hotel) => {
          // Знаходимо всі номери для готелю
          const hotelApartments = apartments.filter(a => a.establishment?.id === hotel.id);
          const prices = hotelApartments.map(a => a.price).filter(p => typeof p === "number" && !isNaN(p));
          let priceText = "See the price when choosing a room.";

          if (prices.length > 0) {
            const allSame = prices.every(p => p === prices[0]);
            if (allSame) {
              priceText = `${prices[0]} ₴ / night`;
            } else {
              const minPrice = Math.min(...prices);
              priceText = `from ${minPrice} ₴ / night`;
            }
          }

          return (
            <div className="col-md-6 col-lg-3 mb-4" key={hotel.id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={hotel.photos?.[0] || "/noimage.png"}
                  className="card-img-top"
                  alt={hotel.name}
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{hotel.name}</h5>
                  <p className="card-text text-muted small mb-1">{hotel.address}</p>
                  <p className="card-text small flex-grow-1">{hotel.description}</p>
                  <p className="fw-bold mt-2">{priceText}</p>
                  <Link
                    to={`/hotels/${hotel.id}`}
                    className="btn btn-outline-primary btn-sm mt-auto"
                  >
                    Review
                  </Link>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-12">
          <p className="text-center text-muted">
            No hotels found according to the specified parameters.
          </p>
        </div>
      )}
    </div>
  </div>
);
};

export default Home;
