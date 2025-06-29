import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axios";
import { createReview } from "../api/reviewApi";
import { addFavorite, removeFavorite, getUserFavorites } from "../api/favoriteApi";

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingApartment, setBookingApartment] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    dateFrom: "",
    dateTo: ""
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [favoriteApartments, setFavoriteApartments] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [reviewForm, setReviewForm] = useState({
    apartmentId: "",
    text: "",
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/api/establishments/${id}`)
      .then((res) => setHotel(res.data))
      .catch(() => setHotel(null));

    axiosInstance.get("/api/apartments")
      .then((res) => {
        const filtered = res.data.filter((a) => a.establishment?.id == id);
        setApartments(filtered);
      })
      .catch(() => setApartments([]));

    axiosInstance.get("/api/reviews")
      .then((res) => {
        const filtered = res.data.filter((r) => r.apartment?.establishment?.id == id);
        setReviews(filtered);
      })
      .catch(() => setReviews([]));
  }, [id]);

  useEffect(() => {
    if (user?.id) {
      getUserFavorites(user.id).then(favs => {
        setFavorites(favs); // це повний масив (з id, apartmentId тощо)
        setFavoriteApartments(favs.map(f => f.apartmentId));
      });
    }
  }, [user?.id]);



  /*
  ВАЖЛИВО! ⚠️
  На даний момент бекенд BookIt має схему, де поле BookingId у Review є обов'язковим (NOT NULL).
  Якщо спробувати створити відгук без bookingId (наприклад, просто для apartment), 
  БД може повернути помилку зовнішнього ключа (foreign key violation) і запит завершиться з 500.
  Це не помилка фронтенду — змінити це можна тільки через зміну міграції та схеми на бекенді.

  Якщо в майбутньому виникатимуть проблеми з відправкою відгуків, 
  потрібно або передавати валідний bookingId, або зробити поле bookingId nullable у базі.
*/

  // Відправка відгуку
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const reviewData = {
        text: reviewForm.text,
        rating: reviewForm.rating,
        apartmentId: parseInt(reviewForm.apartmentId),
      };
      await createReview(reviewData);
      setShowReviewForm(false);
      setReviewForm({ apartmentId: "", text: "", rating: 5 });

      // Оновити список відгуків
      axiosInstance.get("/api/reviews")
        .then((res) => {
          const filtered = res.data.filter((r) => r.apartment?.establishment?.id == id);
          setReviews(filtered);
        });
    } catch (error) {
      alert("Error submitting review!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReserveClick = (apartment) => {
    const token = localStorage.getItem('token');
      if (!token) {
        alert("You need to be logged in to reserve a room.");
        return;
    }
    setBookingApartment(apartment);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
      e.preventDefault();
      setBookingLoading(true);
      try {  
        const bookingData = {
          dateFrom: bookingForm.dateFrom,
          dateTo: bookingForm.dateTo,
          apartmentId: bookingApartment.id,
          customerId: user.id
        };
        await axiosInstance.post("/api/bookings", bookingData);
        setShowBookingForm(false);
        setBookingForm({ dateFrom: "", dateTo: "" });
        alert("Booking successful!");
      } catch (err) {
        alert("Error booking room.");
      } finally {
        setBookingLoading(false);
      }
    };

  const handleToggleFavorite = async (apartmentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("You need to be logged in to reserve a room.");
        return;
    }
   
    const favorite = favorites.find(f => f.apartmentId === apartmentId);

    if (favorite) {
      await removeFavorite(favorite.id); // тут використовуємо id з favorites
      // оновити локальний стан після видалення
      const updated = favorites.filter(f => f.apartmentId !== apartmentId);
      setFavorites(updated);
      setFavoriteApartments(updated.map(f => f.apartmentId));
    } else {

      const payload = { userId: user.id, apartmentId };
      console.log("favorite payload:", payload);

      await addFavorite(payload);

      // після додавання краще підвантажити весь список ще раз
      const updated = await getUserFavorites(user.id);
      setFavorites(updated);
      setFavoriteApartments(updated.map(f => f.apartmentId));
    }
  };



  if (!hotel) return <div>Loading...</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-3">{hotel.name}</h1>
      <p>{hotel.description}</p>

      <h3 className="mt-5">Apartments</h3>
      <div className="row">
        {apartments.map((apt) => (
          <div key={apt.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <img src={apt.photos?.[0] || "/noimage.png"} className="card-img-top" alt={apt.name} />
              <div className="card-body">
                <h5 className="card-title">{apt.name}</h5>
                <p className="card-text">{apt.description}</p>
                <p>Price: {apt.price} ₴ / night</p>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleReserveClick(apt)}
                >
                  Reserve
                </button>
                <button
                  className={`btn btn-sm ${favoriteApartments.includes(apt.id) ? "btn-danger" : "btn-outline-secondary"} ms-2`}
                  onClick={() => handleToggleFavorite(apt.id)}
                >
                  {favoriteApartments.includes(apt.id) ? "Remove from favorite" : "Add to favorite"}
                </button>


              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Booling form/modal */} 
      {showBookingForm && (
          <form
            className="border rounded p-4 mt-3"
            style={{ maxWidth: 400, background: "#f8f8f8" }}
            onSubmit={handleBookingSubmit}
          >
            <h5>Reserve: {bookingApartment?.name}</h5>
            <div className="mb-2">
              <label>Date from:</label>
              <input
                type="date"
                className="form-control"
                required
                value={bookingForm.dateFrom}
                onChange={e => setBookingForm(f => ({ ...f, dateFrom: e.target.value }))}
              />
            </div>
            <div className="mb-2">
              <label>Date to:</label>
              <input
                type="date"
                className="form-control"
                required
                value={bookingForm.dateTo}
                onChange={e => setBookingForm(f => ({ ...f, dateTo: e.target.value }))}
              />
            </div>
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-success" type="submit" disabled={bookingLoading}>
                Book
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowBookingForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}


        {/* Відгуки */} 
      <h3 className="mt-5">Reviews</h3>
      <ul className="list-group mb-3">
        {reviews.length === 0 ? (
          <li className="list-group-item text-muted text-center">
            There are no reviews yet
          </li>
        ) : (
          reviews.map((rev) => (
            <li key={rev.id} className="list-group-item">
              <strong>{rev.user?.username || "User"}:</strong> {rev.text}
            </li>
          ))
        )}
      </ul>
      <button className="btn btn-primary" onClick={() => setShowReviewForm(true)}>
        Leave a review
      </button>

      {/* Review form/modal */}
      {showReviewForm && (
        <form
          className="border rounded p-4 mt-3"
          style={{ maxWidth: 500, background: "#f9f9f9" }}
          onSubmit={handleSubmitReview}
        >
          <h5>Leave your review</h5>
          <div className="mb-2">
            <label>Room</label>
            <select
              className="form-select"
              name="apartmentId"
              value={reviewForm.apartmentId}
              onChange={e => setReviewForm(f => ({ ...f, apartmentId: e.target.value }))}
              required
            >
              <option value="">Select apartment</option>
              {apartments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label>Rating</label>
            <select
              className="form-select"
              name="rating"
              value={reviewForm.rating}
              onChange={e => setReviewForm(f => ({ ...f, rating: e.target.value }))}
              required
            >
              {[5, 4, 3, 2, 1].map(star => (
                <option key={star} value={star}>{star}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label>Your review</label>
            <textarea
              className="form-control"
              name="text"
              rows={3}
              value={reviewForm.text}
              onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
              required
            />
          </div>
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-success" type="submit" disabled={submitting}>
              Submit
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setShowReviewForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      

    </div>
  );
};

export default HotelDetails;
