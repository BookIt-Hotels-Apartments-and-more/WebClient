import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {axiosInstance} from "../api/axios";

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Завантажити готель
    axiosInstance.get(`/establishments/${id}`).then((res) => {
      setHotel(res.data);
    });

    // Завантажити квартири → фільтруємо по Establishment.id
    axiosInstance.get("/apartments").then((res) => {
      const filtered = res.data.filter((a) => a.establishment?.id == id);
      setApartments(filtered);
    });

    // Завантажити всі відгуки → TODO: фільтрувати по апартаментам
    axiosInstance.get("/reviews").then((res) => {
      const filtered = res.data.filter((r) => r.apartment?.establishment?.id == id);
      setReviews(filtered);
    });
  }, [id]);

  if (!hotel) return <div>Завантаження...</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-3">{hotel.name}</h1>
      <p>{hotel.description}</p>

      <h3 className="mt-5">Номери</h3>
      <div className="row">
        {apartments.map((apt) => (
          <div key={apt.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <img src={apt.photos[0]} className="card-img-top" alt={apt.name} />
              <div className="card-body">
                <h5 className="card-title">{apt.name}</h5>
                <p className="card-text">{apt.description}</p>
                <p>Ціна: {apt.price}₴ / ніч</p>
                <button className="btn btn-sm btn-outline-secondary">Забронювати</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-5">Відгуки</h3>
      <ul className="list-group">
        {reviews.map((rev) => (
          <li key={rev.id} className="list-group-item">
            <strong>{rev.user?.username || "Користувач"}:</strong> {rev.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HotelDetails;
