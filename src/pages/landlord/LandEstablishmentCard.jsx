import { useEffect, useState } from "react";
import {
  getApartmentsByEstablishment,
  deleteApartment,
} from "../../api/apartmentApi";
import {
  deleteBooking,
  checkInBooking,
} from "../../api/bookingApi";
import {
  getAllReviews,
  deleteReview,
} from "../../api/reviewApi";
import { deleteEstablishment } from "../../api/establishmentsApi";
import { Link } from "react-router-dom";
import { APARTMENT_FEATURE_LABELS, ESTABLISHMENT_FEATURE_LABELS, decodeFlagsUser } from "../../utils/enums";

const LandEstablishmentCard = ({ est, reloadStats  }) => {
  const [apartments, setApartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allApts = await getApartmentsByEstablishment(est.id);
      setApartments(Array.isArray(allApts) ? allApts : []);

      const aggregated = (allApts ?? [])
        .flatMap(a => Array.isArray(a.bookings) ? a.bookings.map(b => {
          return b?.apartment ? b : { ...b, apartment: a };
        }) : []);
      setBookings(aggregated);

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
      reloadStats();
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

  function getApartmentFeatureNames(features) {
    return Object.keys(APARTMENT_FEATURE_LABELS)
      .filter(key => (features & (1 << APARTMENT_FEATURE_LABELS[key])) !== 0)
      .join(", ");
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
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

        {/* Вивід фото готелю */}
        <p className="card-text">Hotel photos:</p>
        {est.photos && est.photos.length > 0 && (
          <div className="d-flex flex-wrap gap-2 my-2">
            {est.photos.map((photo, idx) => (
              <img
                key={photo.id || photo.blobUrl || idx}
                src={photo.blobUrl}
                alt="Hotel"
                width={88}
                height={68}
                style={{
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #e0e0e0",
                  marginRight: 8,
                  marginBottom: 6
                }}
              />
            ))}
          </div>
        )}

        {/* Вивід удобств */}
        <p className="card-text mb-1 fw-bold">Facilities:</p>

        {(() => {
          let featureNames = [];

          if (typeof est?.features === "number") {
            // бек віддав бітмаску
            featureNames = decodeFlagsUser(est.features, ESTABLISHMENT_FEATURE_LABELS);
          } else if (est?.features && typeof est.features === "object") {
            // бек віддав об’єкт булів { parking: true, ... }
            featureNames = Object.keys(ESTABLISHMENT_FEATURE_LABELS).filter(k =>
              est.features[k.charAt(0).toLowerCase() + k.slice(1)]
            );
          }

          if (featureNames.length === 0) {
            return <div className="text-muted mb-2">No facilities specified</div>;
          }

          return (
            <div className="d-flex flex-wrap gap-3 mb-2">
              {featureNames.map((name) => (
                <span
                  key={name}
                  className="d-inline-flex align-items-center"
                  style={{
                    fontSize: 12,
                    color: "#001B48",
                    background: "#D6E7EE",
                    padding: "4px 10px",
                    borderRadius: 14,
                    boxShadow: "0 1px 4px #e2e8f0",
                  }}
                >
                  <img
                    src={`/images/features/${name}.png`}
                    alt={name}
                    style={{ width: 18, height: 18, marginRight: 6 }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  {name.replace(/([A-Z])/g, " $1").trim()}
                </span>
              ))}
            </div>
          );
        })()}

        <hr />

        <Link
          to={`/add-apartment/${est.id}`}
          className="btn btn-success btn-sm mt-2">
          Add apartment
        </Link>

        <hr />
        <h6>Apartment:</h6>
          {apartments.map((apt) => (
            <div
              key={apt.id}
              className="border p-2 mb-2 rounded"
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  🛏 {apt.name} — {apt.area} (м²) — {apt.price}$
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

              {/* Фото апартамента */}
              {apt.photos && apt.photos.length > 0 && (
                <div className="d-flex gap-2 mt-2 mb-1 flex-wrap">
                  {apt.photos.map((photo, idx) => (
                    <img
                      key={photo.id || photo.blobUrl || idx}
                      src={photo.blobUrl}
                      alt="Apartment"
                      width={70}
                      height={54}
                      style={{
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e0e0e0"
                      }}
                    />
                  ))}             
                </div>                
              )}
              {apt.description}
              {/* Вивід зручностей апартаменту (з іконками) */}
              <div className="mb-2 mt-2">
                <p className="card-text mb-1 fw-bold">Room facilities:</p>

                {(() => {
                  let featureNames = [];

                  if (typeof apt?.features === "number") {
                    // бек повернув бітмаску
                    featureNames = decodeFlagsUser(apt.features, APARTMENT_FEATURE_LABELS);
                  } else if (apt?.features && typeof apt.features === "object") {
                    // бек повернув об’єкт булів { freeWifi: true, ... }
                    featureNames = Object.keys(APARTMENT_FEATURE_LABELS).filter(k =>
                      apt.features[k.charAt(0).toLowerCase() + k.slice(1)]
                    );
                  }

                  if (featureNames.length === 0) {
                    return <div className="text-muted">No facilities</div>;
                  }

                  return (
                    <div className="d-flex flex-wrap gap-2">
                      {featureNames.map((name) => (
                        <span
                          key={name}
                          className="d-inline-flex align-items-center"
                          style={{
                            fontSize: 12,
                            color: "#001B48",
                            background: "#EEF5FF",
                            padding: "4px 10px",
                            borderRadius: 14,
                            boxShadow: "0 1px 4px #e2e8f0",
                          }}
                        >
                          <img
                            src={`/images/features/${name}.png`}  // ВАЖЛИВО: без .toLowerCase()
                            alt={name}
                            style={{ width: 18, height: 18, marginRight: 6 }}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                          {name.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      ))}
                    </div>
                  );
                })()}
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
                  🧑 User: {b.customer.username} (e-mail: {b.customer.email}) — from {formatDate(b.dateFrom)} ➝ to {formatDate(b.dateTo)}
                </div>
                <div>
                  <button
                    className={`btn btn-sm me-2 ${b.isCheckedIn ? "btn-success" : "btn-outline-primary"}`}
                    disabled={b.isCheckedIn}
                    onClick={() => handleCheckIn(b.id)}
                  >
                    {b.isCheckedIn ? "Checked In" : "Confirm"}
                  </button>
                  <button
                    className="btn btn-sm me-2 btn-outline-danger"
                    onClick={() => handleCancelBooking(b.id)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    // Додати реалізацію оцінки клієнта (куди і як будемо застосовувати рейтинг?)                    
                  >
                    Rate the client
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
