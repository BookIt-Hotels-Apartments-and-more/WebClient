import { useEffect, useState } from "react";
import {
  getApartmentsByEstablishment,
  deleteApartment,
} from "../../api/apartmentApi";
import {
  getAllBookings,
  deleteBooking,
  checkInBooking,
} from "../../api/bookingApi";
import {
  getAllReviews,
  deleteReview,
} from "../../api/reviewApi";
import { deleteEstablishment } from "../../api/establishmentsApi";
import { Link } from "react-router-dom";

const LandEstablishmentCard = ({ est }) => {
  const [apartments, setApartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showAddApartment, setShowAddApartment] = useState(false);
  const [newApartment, setNewApartment] = useState({ name: "", price: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const apartmentsData = await getApartmentsByEstablishment(est.id);
      setApartments(apartmentsData);

      const bookingsData = await getAllBookings();
      const filteredBookings = bookingsData.filter((b) =>
        apartmentsData.some((a) => a.id === b.apartmentId)
      );
      setBookings(filteredBookings);

      const reviewsData = await getAllReviews();
      const filteredReviews = reviewsData.filter((r) =>
        apartmentsData.some((a) => a.id === r.apartmentId)
      );
      setReviews(filteredReviews);
    } catch (err) {
      console.error("❌ Помилка при завантаженні:", err);
    }
  };

  const handleDeleteHotel = async () => {
    if (confirm("Ви впевнені, що хочете видалити готель?")) {
      await deleteEstablishment(est.id);
      window.location.reload();
    }
  };

  const handleDeleteApartment = async (id) => {
    if (confirm("Видалити номер?")) {
      await deleteApartment(id);
      setApartments((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await checkInBooking(bookingId);
      await loadData();
    } catch (err) {
      console.error("❌ Помилка при check-in:", err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (confirm("Скасувати бронювання?")) {
      await deleteBooking(bookingId);
      await loadData();
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (confirm("Видалити відгук?")) {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  const handleChangeApartment = (e) => {
    setNewApartment({ ...newApartment, [e.target.name]: e.target.value });
  };

  const handleAddApartment = async (e) => {
    e.preventDefault();
    // Тут можна реалізувати додавання через API
    setShowAddApartment(false);
  };

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{est.name}</h5>
        <p className="text-muted">
          Загальна кількість номерів: {apartments.length}
        </p>

        <p className="card-text text-muted">{est.location}</p>
        <p className="card-text">{est.description}</p>
        <button
          className="btn btn-danger btn-sm me-2"
          onClick={handleDeleteHotel}
        >
          Видалити готель
        </button>
        <Link
          to={`/edit-hotel/${est.id}`}
          className="btn btn-outline-primary btn-sm"
        >
          Редагувати
        </Link>

        <hr />

        <button
          className="btn btn-sm btn-outline-success mb-3"
          onClick={() => setShowAddApartment(true)}
        >
          ➕ Додати номер
        </button>

        {showAddApartment && (
          <form
            onSubmit={handleAddApartment}
            className="border p-3 mb-3 rounded bg-light"
          >
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Назва"
                value={newApartment.name}
                onChange={handleChangeApartment}
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="number"
                className="form-control"
                name="price"
                placeholder="Ціна"
                value={newApartment.price}
                onChange={handleChangeApartment}
                required
              />
            </div>
            <button className="btn btn-primary btn-sm" type="submit">
              Додати
            </button>
          </form>
        )}

        <hr />
        <h6>Номери:</h6>
        {apartments.map((apt) => (
          <div
            key={apt.id}
            className="border p-2 mb-2 rounded d-flex justify-content-between"
          >
            <div>
              🛏 {apt.name} — {apt.price}₴
            </div>
            <div>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDeleteApartment(apt.id)}
              >
                Видалити
              </button>
              <Link
                to={`/edit-apartment/${apt.id}`}
                className="btn btn-outline-secondary btn-sm ms-2"
              >
                Редагувати
              </Link>
            </div>
          </div>
        ))}

        <hr />
        <h6 className="mt-4">Бронювання:</h6>
        {bookings.length === 0 ? (
          <p className="text-muted">Немає бронювань</p>
        ) : (
          <ul className="list-group">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="list-group-item d-flex justify-content-between"
              >
                <div>
                  🧑 Користувач {b.userId} — {b.dateFrom} ➝ {b.dateTo}
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={() => handleCheckIn(b.id)}
                  >
                    Підтвердити
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleCancelBooking(b.id)}
                  >
                    Скасувати
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <hr />
        <h6 className="mt-4">Відгуки:</h6>
        {reviews.length === 0 ? (
          <p className="text-muted">Відгуків поки немає</p>
        ) : (
          <ul className="list-group">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  ⭐ {r.rating}/5: {r.text}
                </span>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteReview(r.id)}
                >
                  Видалити
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LandEstablishmentCard;
