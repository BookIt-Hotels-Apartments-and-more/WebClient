import { useEffect, useState } from "react";
import {
  getApartmentsByEstablishment,
  deleteApartment,
  createApartment,
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

const LandEstablishmentCard = ({ est, reloadStats  }) => {
  const [apartments, setApartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showAddApartment, setShowAddApartment] = useState(false);
  const [newApartment, setNewApartment] = useState({
      name: "",
      price: 0,
      capacity: 1,
      description: ""
    });


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allApts = await getApartmentsByEstablishment(est.id);
      setApartments(allApts);

      const bookingsData = await getAllBookings();
      const filteredBookings = bookingsData.filter(
      b => b.apartment && b.apartment.establishment.id === est.id
      );
      setBookings(filteredBookings);

      const reviewsData = await getAllReviews();
      const filteredReviews = reviewsData.filter(
      r =>
        r.booking &&
        r.booking.apartment &&
        r.booking.apartment.establishment.id === est.id
      );
      setReviews(filteredReviews);
    } catch (err) {
      console.error("❌ Error while loading:", err);
    }
  };

  const handleDeleteHotel = async () => {
    if (confirm("Are you sure you want to delete the hotel?")) {
      await deleteEstablishment(est.id);
      window.location.reload();
    }
  };

  const handleDeleteApartment = async (id) => {
      if (confirm("Delete room?")) {
        await deleteApartment(id);
        await loadData();
        if (reloadStats) reloadStats();
      }
    };

  const handleCheckIn = async (bookingId) => {
    try {
      await checkInBooking(bookingId);
      await loadData();
    } catch (err) {
      console.error("❌ Error during check-in:", err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (confirm("Cancel booking?")) {
      await deleteBooking(bookingId);
      await loadData();
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (confirm("Delete review?")) {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  const handleChangeApartment = (e) => {
    setNewApartment({ ...newApartment, [e.target.name]: e.target.value });
  };

  const handleAddApartment = async (e) => {
      e.preventDefault();
      try {
        await createApartment({
          ...newApartment,
          establishmentId: est.id, 
        });
        await loadData();
        if (reloadStats) reloadStats();
        setShowAddApartment(false);
        setNewApartment({ name: "", price: 0, capacity: 0, description: "" });
      } catch (err) {
        alert("❌ Error adding apartment");
        console.error(err);
      }
    };




  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{est.name}</h5>
        <p className="text-muted">
          Total number of apartment: {apartments.length}
        </p>

        <p className="card-text text-muted">{est.location}</p>
        <p className="card-text">{est.description}</p>
        <button
          className="btn btn-danger btn-sm me-2"
          onClick={handleDeleteHotel}
        >
          Remove hotel
        </button>
        <Link
          to={`/edit-hotel/${est.id}`}
          className="btn btn-outline-primary btn-sm"
        >
          Edit
        </Link>

        <hr />

        <button
          className="btn btn-sm btn-outline-success mb-3"
          onClick={() => setShowAddApartment(true)}
        >
          ➕ Add apartment
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
                placeholder="Name"
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
                placeholder="Price"
                value={newApartment.price}
                onChange={handleChangeApartment}
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="capacity"
                className="form-control"
                name="capacity"
                placeholder="Capacity"
                value={newApartment.capacity}
                onChange={handleChangeApartment}
                min={1}
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="description"
                className="form-control"
                name="description"
                placeholder="Description"
                value={newApartment.description}
                onChange={handleChangeApartment}
                required
              />
            </div>        
                      
              
            <button className="btn btn-primary btn-sm" type="submit">
              Add
            </button>
          </form>
        )}

        <hr />
        <h6>Apartment:</h6>
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
                Remove
              </button>
              <Link
                to={`/edit-apartment/${apt.id}`}
                className="btn btn-outline-secondary btn-sm ms-2"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}

        <hr />
        <h6 className="mt-4">Booking:</h6>
        {bookings.length === 0 ? (
          <p className="text-muted">No reservations</p>
        ) : (
          <ul className="list-group">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="list-group-item d-flex justify-content-between"
              >
                <div>
                  🧑 User {b.userId} — {b.dateFrom} ➝ {b.dateTo}
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={() => handleCheckIn(b.id)}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleCancelBooking(b.id)}
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <hr />
        <h6 className="mt-4">Reviews:</h6>
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet</p>
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
                  Remove
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
