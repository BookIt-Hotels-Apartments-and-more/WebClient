import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../api/axios";
import { createBooking } from "../api/bookingApi";
import { createReview } from "../api/reviewApi";
import { getAllReviews } from "../api/reviewApi";
import BookingBannerForm from '../components/BookingBannerForm';
import { addFavorite, removeFavorite, getUserFavorites } from "../api/favoriteApi";
import {
  ESTABLISHMENT_TYPE_LABELS,
  ESTABLISHMENT_FEATURE_LABELS,
  APARTMENT_FEATURE_LABELS,
  decodeFlags
} from '../utils/enums';

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingApartment, setBookingApartment] = useState(null);
  const [bookingApartmentId, setBookingApartmentId] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    dateFrom: "",
    dateTo: ""
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [favoriteApartments, setFavoriteApartments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("about");
  const [previewIndexes, setPreviewIndexes] = useState({});


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
        setFavorites(favs); 
        setFavoriteApartments(favs.map(f => f.apartmentId));
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (!id) return;
    let ids = JSON.parse(localStorage.getItem("recentHotels") || "[]");
    ids = [Number(id), ...ids.filter(i => i !== Number(id))].slice(0, 6);
    localStorage.setItem("recentHotels", JSON.stringify(ids));
  }, [id]);

  useEffect(() => {
  axiosInstance.get("/api/bookings")
    .then((res) => {
      const filtered = res.data.filter(
        b => b.apartment?.establishment?.id == id
      );
      setBookings(filtered);
    })
    .catch(() => setBookings([]));
}, [id]);

  useEffect(() => {
  if (!hotel?.id) return;
  getAllReviews().then((allReviews) => {
    const hotelReviews = allReviews.filter(
      r =>
        r.booking &&
        r.booking.apartment &&
        r.booking.apartment.establishment &&
        r.booking.apartment.establishment.id === hotel.id
    );
    setReviewsCount(hotelReviews.length);
  });
}, [hotel?.id]);


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

  const handleBooking = async (apartmentId) => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }

    // 1. Перевірка авторизації
    if (!user || !user.id || !localStorage.getItem("token")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      alert("Щоб забронювати номер, увійдіть у свій обліковий запис!");
      window.location.href = '/login';
      return;
    }


    // 2. Дати бронювання з BookingBannerForm (localStorage)
    const form = JSON.parse(localStorage.getItem("bookingForm") || "{}");
    if (!form.checkIn || !form.checkOut) {
      alert("Будь ласка, виберіть дати для бронювання.");
      return;
    }

    // 3. Формуємо payload у потрібному форматі
    const bookingData = {
      dateFrom: form.checkIn.length === 10 ? form.checkIn + "T00:00:00" : form.checkIn, // "2025-07-09T00:00:00"
      dateTo: form.checkOut.length === 10 ? form.checkOut + "T00:00:00" : form.checkOut,
      customerId: user.id,
      apartmentId,
    };

    try {
      await createBooking(bookingData);
      alert("Бронювання успішне! Деталі можна переглянути в кабінеті користувача.");
      // Можна додати редірект у кабінет:
      // window.location.href = '/cabinet';
    } catch (e) {
      alert("Помилка при створенні бронювання.");
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

  const RatingCategory = ({ label, value }) => (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: 15, fontWeight: 500 }}>
        <span>{label}</span>
        <span style={{ color: "#001B48", fontWeight: 600 }}>{value.toFixed(1)}</span>
      </div>
      <div style={{ width: "100%", height: 8, borderRadius: 4, background: "#F2F6FF" }}>
        <div
          style={{
            height: 8,
            borderRadius: 4,
            width: `${Math.round((value / 10) * 100)}%`,
            background: "#22614D",
            transition: "width .3s"
          }}
        />
      </div>
    </div>
  );


  if (!hotel) return <div>Loading...</div>;

  return (
    
    <div>
      {/* Банер */}
      <div className='baner'
        style={{
          width: '100%',
          maxWidth: '1955px',
          minHeight: '687px',
          backgroundImage: "url('/images/homebaner.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          margin: '0 auto',
          marginTop: '-110px',
          marginBlockEnd: '-100px',
          zIndex: 1
        }}>
      </div>
      <BookingBannerForm />

      <div className="container py-4">    
      {/* 1. БАНЕР ІНФО (загальне фото + назва + рейтинг + ціна) */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="position-relative" style={{ overflow: "hidden", minHeight: 560, borderRadius: 12, boxShadow: "0 0 5px 3px #D6E7EE" }}>
            {/* Велике фото готелю */}
            <img
              src={hotel.photos?.[photoIndex]?.blobUrl || "/noimage.png"}
              alt={hotel.name}
              style={{ width: "100%", height: 560, objectFit: "cover", borderRadius: 12 }}
            />

            <div
                className="position-absolute top-0 start-0 w-100 px-4 pt-3 d-flex flex-wrap gap-2"
                style={{ zIndex: 2 }}
              >
                {decodeFlags(hotel.features, ESTABLISHMENT_FEATURE_LABELS)
                  .split(",")
                  .map((feature, i) =>
                    feature.trim() ? (
                      <span
                        key={i}
                        style={{
                          background: "#D6E7EE", 
                          color: "#001B48",
                          fontWeight: 500,
                          fontSize: 15,
                          borderRadius: 16,
                          padding: "4px 16px",
                          boxShadow: "0 1px 4px #e2e8f0"
                        }}
                      >
                        {feature.trim()}
                      </span>
                    ) : <p key={i}>Feature hotel:</p>
                  )}
              </div>

            {/* Назва, рейтинг та ціна поверх фото */}
            <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: "rgba(0,0,0,0.05)" }}>
              <div className="d-flex align-items-center mb-2">
                <span className="badge me-2" style={{ fontSize: 17, background: "#fff", color: "#BF9D78" }}>
                  <img src="/images/reitingstar.png" alt="Star" style={{ width: 16, height: 16, marginRight: 7 }} />
                  {hotel.rating?.toFixed(1) ?? "9.5"}
                </span>            
              </div>
              <h2 className="text-white mb-1" style={{ fontWeight: 700 }}>{hotel.name}</h2>
              
              <div className="d-flex space-between mb-2">
                <span style={{ background: "#fff", borderRadius: 10, padding: "3px 12px" }}>
              <span style={{ fontWeight: 400, fontSize: 15, color: "#02457A" }}>Start from </span>
              <span style={{ fontWeight: 700, fontSize: 24, color: "#02457A" }}>
                {apartments[0]?.price ? `${apartments[0].price} $` : "See prices"}
              </span>
            </span>

                  {/* Кнопки перемикання фото */}
            <div
              className="position-absolute"
              style={{
                bottom: 18,
                right: 22,
                zIndex: 3,
                display: "flex",
                gap: 10
              }}
            >
              <button
                className="btn  btn-sm"
                style={{
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  marginRight: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                disabled={photoIndex === 0}
                onClick={() => setPhotoIndex(i => Math.max(i - 1, 0))}
              >
                <img
                  src="/images/left-icon.png"
                  alt="Previous"
                  style={{ objectFit: "contain" }}
                />
              </button>
              <button
                className="btn btn-sm"
                style={{
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                disabled={photoIndex === hotel.photos.length - 1}
                onClick={() => setPhotoIndex(i => Math.min(i + 1, hotel.photos.length - 1))}
              >
                <img
                  src="/images/right-icon.png"
                  alt="Next"
                  style={{ objectFit: "contain" }}
                />
              </button>
            </div>      
              </div>          

            </div>
          </div>
        </div>
        
        {/* 2. ДОДАТКОВА ІНФОРМАЦІЯ: карта/рейтинг */}
        <div className="col-md-4">

          {/* Гугл карта з позначкою місця готеля*/}
          <div className="card mb-3" style={{ borderRadius: 12, padding: 0, boxShadow: "0 0 5px 3px #D6E7EE"  }}>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ width: "100%", height: 250, borderRadius: 12, overflow: "hidden", margin: 0 }}>
                <iframe
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(hotel.address)}&output=embed`}
                  title="Hotel location"
                />
              </div>
            </div>
          </div>

          {/* Блок рейтінг готеля */}
          <div
            className="mb-3"
            style={{
              borderRadius: 12,
              boxShadow: "0 0 5px 3px #D6E7EE", 
              background: "#fff",
              padding: 28,
              maxWidth: 450,
              margin: "0 auto"
            }}
          >
            {/* Top row: Star + rating + Excellent + reviews */}
            <div className="d-flex align-items-center justify-content-center mb-2" style={{ gap: 10 }}>
              <img src="/images/reitingstar-orange.png" alt="star" style={{ width: 26, height: 26, marginRight: 6 }} />
              <span style={{ color: "#FE7C2C", fontWeight: 700, fontSize: 26, marginRight: 6 }}>9.8</span>
              <span style={{ fontWeight: 500, color: "#001B48" }}>Excellent rating</span>
              <a href="#reviews"
                style={{marginLeft: 10, color: "#0074e4", fontWeight: 500, fontSize: 16, textDecoration: "underline" }}>
                {reviewsCount} reviews
              </a>

            </div>

            {/* Список категорій */}
            <div className="row" style={{ marginTop: 14 }}>
              <div className="col-6" style={{ padding: "0 12px" }}>
                <RatingCategory label="Staff" value={9.5} />
                <RatingCategory label="Purity" value={9.6} />
                <RatingCategory label="Price/quality ratio" value={8.3} />
              </div>
              <div className="col-6" style={{ padding: "0 12px" }}>
                <RatingCategory label="Comfort" value={9.7} />
                <RatingCategory label="Facilities" value={9.6} />
                <RatingCategory label="Location" value={9.7} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. ОПИС */}
      <div className="row mb-4">
      <div className="col-md-6">
        {/* Вкладки */}
        <div className="mb-3 d-flex gap-4" style={{ marginBottom: "40px" }}>
          <button
            className={`btn ${activeTab === "about" ? "btn-primary" : "btn-light"}`}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>
          <button
            className={`btn ${activeTab === "services" ? "btn-primary" : "btn-light"}`}
            onClick={() => setActiveTab("services")}
          >
            Services
          </button>
          <button
            className={`btn ${activeTab === "terms" ? "btn-primary" : "btn-light"}`}
            onClick={() => setActiveTab("terms")}
          >
            Terms of accommodation
          </button>
        </div>
        {/* Контент вкладки */}
        <div
          className="p-4"
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 0 5px 3px #D6E7EE",
            minHeight: 600,
          }}
        >
          {activeTab === "about" && (
            <>
              <div className="mb-2" style={{ color: "#0275d8", fontWeight: 500 }}>
                <i className="bi bi-geo-alt" /> {hotel.address}
              </div>
              <div style={{ fontSize: 15 }}>{hotel.description}</div>
            </>
          )}
          {activeTab === "services" && (
            <ul style={{ fontSize: 15, marginBottom: 0 }}>
              {decodeFlags(hotel.features, ESTABLISHMENT_FEATURE_LABELS)
                .split(",")
                .filter(Boolean)
                .map((feat, i) => (
                  <li key={i}>{feat.trim()}</li>
                ))}
            </ul>
          )}
          {activeTab === "terms" && (
            <div style={{ fontSize: 15 }}>
              {hotel.terms || "No terms of accommodation provided."}
            </div>
          )}
        </div>
      </div>

      {/* Rooms – картки номерів */}
      <div className="col-md-6" style={{ fontSize: 15 }}>
        {apartments.length === 0 && <div className="text-muted">No rooms found</div>}
        {apartments.map((apt) => {
          const currentPreviewIdx = previewIndexes[apt.id] || 0;
          const mainPhoto = apt.photos?.[currentPreviewIdx];
          const thumbnails = (apt.photos || []).filter((_, i) => i !== currentPreviewIdx).slice(0, 3);

          return (
            <React.Fragment key={apt.id}>
              <div className="card mb-4" style={{ borderRadius: 16, overflow: "hidden", padding: 0, boxShadow: "0 0 5px 3px #D6E7EE" }}>
                <div className="d-flex flex-row" style={{ minHeight: 200 }}>
                  <div style={{ width: 220, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {/* Головне фото */}
                    <img
                      src={mainPhoto?.blobUrl || "/noimage.png"}
                      alt={apt.name}
                      style={{
                        width: 200,
                        height: 140,
                        objectFit: "cover",
                        borderRadius: 10,
                        margin: "10px 0 6px 0",
                      }}
                    />
                    {/* Мініатюри */}
                    <div className="d-flex" style={{ gap: 5 }}>
                      {thumbnails.map((photo, idx) => {
                        const realIdx = apt.photos.findIndex(p => p.id === photo.id);
                        return (
                          <img
                            key={photo.id || idx}
                            src={photo.blobUrl}
                            alt=""
                            style={{
                              width: 65,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid #eee",
                              cursor: "pointer",
                              boxShadow: "0 1px 4px #ddd"
                            }}
                            onClick={() => {
                              setPreviewIndexes(prev => ({
                                ...prev,
                                [apt.id]: realIdx
                              }));
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  {/* Права частина: інфа про номер */}
                  <div className="flex-grow-1 d-flex flex-column justify-content-between p-3">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: "#001B48" }}>{apt.name}</div>
                      <div className="text-muted" style={{ fontSize: 14, marginBottom: 4 }}>
                        {apt.description}
                      </div>
                      <div className="text-secondary mb-2" style={{ fontSize: 13 }}>
                        {apt.capacity && <>apartments for {apt.capacity} persons</>}
                      </div>
                    </div>
                    <div className="d-flex align-items-end justify-content-between mt-1">
                      <div style={{ fontWeight: 700, fontSize: 18, color: "#02457A" }}>
                        {apt.price} <span style={{ fontWeight: 400, fontSize: 14 }}>$ / night</span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ borderRadius: 8, fontWeight: 600, fontSize: 14, padding: "6px 22px" }}
                        onClick={() => handleBooking(apt.id)}
                      >
                        Book now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* --- Форма бронювання --- */}
              {bookingApartmentId === apt.id && (
                <div className="card mb-4 px-4 py-3" style={{ borderLeft: "4px solid #02457A", borderRadius: 16, boxShadow: "0 0 4px 1px #eee" }}>
                  <h5 className="fw-bold mb-3">Book this room</h5>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setBookingLoading(true);
                      try {
                        const bookingData = {
                          dateFrom: bookingForm.dateFrom,
                          dateTo: bookingForm.dateTo,
                          apartmentId: apt.id,
                          customerId: user.id
                        };
                        await axiosInstance.post("/api/bookings", bookingData);
                        setBookingApartmentId(null);
                        setBookingForm({ dateFrom: "", dateTo: "" });
                        alert("Booking successful!");
                      } catch (err) {
                        alert("Error booking room.");
                      } finally {
                        setBookingLoading(false);
                      }
                    }}
                  >
                    <div className="row mb-2">
                      <div className="col">
                        <label className="form-label">Date from</label>
                        <input
                          type="date"
                          className="form-control"
                          value={bookingForm.dateFrom}
                          onChange={e => setBookingForm(f => ({ ...f, dateFrom: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="col">
                        <label className="form-label">Date to</label>
                        <input
                          type="date"
                          className="form-control"
                          value={bookingForm.dateTo}
                          onChange={e => setBookingForm(f => ({ ...f, dateTo: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-end gap-3">
                      <button className="btn btn-success" disabled={bookingLoading}>Confirm booking</button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setBookingApartmentId(null)}
                        disabled={bookingLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  </div>

    </div>
    
    

  );
};

export default HotelDetails;

