import { useState } from "react";
import { Link } from "react-router-dom";
import { getAllEstablishments } from "../api/establishmentsApi";

const mockHotels = [
  {
    id: 1,
    name: "Готель Карпати",
    description: "Розкішний готель в самому серці гір",
    image: "https://cf.bstatic.com/xdata/images/hotel/square200/123456789.jpg",
    price: 1800,
    address: "Яремче, Україна",
  },
  {
    id: 2,
    name: "Dnipro Luxe Hotel",
    description: "Сучасний готель біля річки у Дніпрі",
    image: "https://cf.bstatic.com/xdata/images/hotel/square200/234567890.jpg",
    price: 2200,
    address: "Дніпро, Україна",
  },
  {
    id: 3,
    name: "Odesa Sea View",
    description: "З видом на море, поруч із пляжем",
    image: "https://cf.bstatic.com/xdata/images/hotel/square200/345678901.jpg",
    price: 2500,
    address: "Одеса, Україна",
  },
  {
    id: 4,
    name: "Kyiv Grand Hotel",
    description: "Комфорт у центрі столиці",
    image: "https://cf.bstatic.com/xdata/images/hotel/square200/456789012.jpg",
    price: 3000,
    address: "Київ, Україна",
  },
];

const Home = () => {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [hotels, setHotels] = useState([]);


//   useEffect(() => {
//   const fetchData = async () => {
//     try {
//       const data = await getAllEstablishments();
//       setHotels(data);
//     } catch (err) {
//       console.error("❌ Помилка при завантаженні готелів:", err);
//     }
//   };

//   fetchData();
// }, []);


  const filteredHotels = mockHotels.filter((hotel) => {
    const matchSearch =
      hotel.name.toLowerCase().includes(search.toLowerCase()) ||
      hotel.address.toLowerCase().includes(search.toLowerCase());

    const matchMin = minPrice === "" || hotel.price >= parseInt(minPrice);
    const matchMax = maxPrice === "" || hotel.price <= parseInt(maxPrice);

    return matchSearch && matchMin && matchMax;
  });

//   const filteredHotels = hotels.filter((hotel) => {
//   const matchSearch =
//     hotel.name.toLowerCase().includes(search.toLowerCase()) ||
//     hotel.address.toLowerCase().includes(search.toLowerCase());

//   const matchMin = minPrice === "" || hotel.price >= parseInt(minPrice);
//   const matchMax = maxPrice === "" || hotel.price <= parseInt(maxPrice);

//   return matchSearch && matchMin && matchMax;
// });


  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
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
      <h1 className="mb-4 fw-bold">Знайдіть найкращі готелі</h1>

      {/* 🔍 Пошук та фільтрація */}
      <div className="row mb-4">
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Пошук по назві або локації"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="number"
            className="form-control"
            placeholder="Мін. ціна"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="number"
            className="form-control"
            placeholder="Макс. ціна"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Сортувати</option>
            <option value="price-asc">Ціна ↑</option>
            <option value="price-desc">Ціна ↓</option>
            <option value="name-asc">Назва A–Z</option>
            <option value="name-desc">Назва Z–A</option>
          </select>
        </div>
      </div>

      {/* 🏨 Вивід готелів */}
      <div className="row">
        {sortedHotels.length > 0 ? (
          sortedHotels.map((hotel) => (
            <div className="col-md-6 col-lg-3 mb-4" key={hotel.id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={hotel.photos?.[0]}
                  className="card-img-top"
                  alt={hotel.name}
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{hotel.name}</h5>
                  <p className="card-text text-muted small mb-1">
                    {hotel.address}
                  </p>
                  <p className="card-text small flex-grow-1">
                    {hotel.description}
                  </p>
                  <p className="fw-bold mt-2">від {hotel.price}₴ / ніч</p>
                  <Link
                    to={`/hotels/${hotel.id}`}
                    className="btn btn-outline-primary btn-sm mt-auto"
                  >
                    Переглянути
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p className="text-center text-muted">
              Готелі не знайдено за заданими параметрами.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
