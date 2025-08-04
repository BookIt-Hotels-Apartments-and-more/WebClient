import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../api/axios";
import { createBooking } from "../api/bookingApi";
import { createReview } from "../api/reviewApi";
import { getAllReviews } from "../api/reviewApi";
import BookingBannerForm from '../components/BookingBannerForm';
import { addFavorite, removeFavorite, getUserFavorites } from "../api/favoriteApi";
import {
  ESTABLISHMENT_FEATURE_LABELS,
  APARTMENT_FEATURE_LABELS,
  PAYMENT_TYPE 
} from '../utils/enums';
import { toast } from 'react-toastify';
import { createUniversalPayment } from "../api/paymentApi";
import { toggleApartmentFavorite } from "../utils/favoriteUtils";

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
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
  const [paymentType, setPaymentType] = useState("Cash");  

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

useEffect(() => {
  if (bookingApartmentId) {
    // При кожному відкритті модалки підтягуй дати з BookingBannerForm
    const form = JSON.parse(localStorage.getItem("bookingForm") || "{}");
    setBookingForm({
      dateFrom: form.checkIn ? toInputDate(form.checkIn) : "",
      dateTo: form.checkOut ? toInputDate(form.checkOut) : ""
    });
  }
}, [bookingApartmentId]);


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

  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    // dateStr вже 'YYYY-MM-DD', просто повертаємо
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // fallback на старі дані
    const d = new Date(dateStr);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return "";
  };

  const handleBooking = async (apartmentId) => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }

    if (!user || !user.id || !localStorage.getItem("token")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      toast.warn("To book a room, log in to your account!", { autoClose: 10000 });
      return;
    }

    // Підтягуємо вибрані дати (з форми або localStorage)
    const form = JSON.parse(localStorage.getItem("bookingForm") || "{}");
    const dateFrom = bookingForm.dateFrom || form.checkIn || "";
    const dateTo = bookingForm.dateTo || form.checkOut || "";

    if (!dateFrom || !dateTo) {
      toast.warn("Please select dates for booking.", { autoClose: 10000 });
      return;
    }

    setBookingLoading(true);

    try {
      // Визначаємо кількість ночей
      const nights = Math.max(1, Math.ceil(
        (new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24)
      ));

      // Знаходимо apartment для ціни
      const apt = apartments.find(a => a.id === apartmentId);
      const price = apt?.price || 0;
      const totalPrice = price * nights;

      // 1. Створюємо бронювання
      const bookingRes = await createBooking({
        dateFrom: dateFrom.length === 10 ? dateFrom + "T00:00:00" : dateFrom,
        dateTo: dateTo.length === 10 ? dateTo + "T00:00:00" : dateTo,
        customerId: user.id,
        apartmentId,
        paymentType // "Cash" / "Mono" / "BankTransfer"
      });

      const bookingId = bookingRes.data?.id ?? bookingRes.id;

      // 2. Створюємо payment
      const payDto = {
        type: PAYMENT_TYPE[paymentType], // Перетворюємо в int
        amount: totalPrice,
        bookingId
      };

      if (paymentType === "Mono") {
        // MonoBank — universal endpoint, чекаємо invoiceUrl
        setBookingLoading(true);
        const payRes = await createUniversalPayment(payDto);
        const invoiceUrl = payRes.data?.invoiceUrl || payRes.data?.url;
        const paymentId = payRes.data?.id || payRes.data?.paymentId;
        if (invoiceUrl) {
          window.open(invoiceUrl, "_blank"); // відкриваємо інвойс у новій вкладці
          setBookingApartmentId(null); // закриваємо модалку бронювання!
          setBookingForm({ dateFrom: "", dateTo: "" });
          toast.success("Payment created! Pay via MonoBank.", { autoClose: 10000 });
        } else {
          toast.warn("Mono invoice error! No URL received.", { autoClose: 10000 });
        }
      } else {
        // Cash або BankTransfer — просто створили payment, інфо для юзера
        await createUniversalPayment(payDto);
        toast.success("Booking successful! Details in your profile.", { autoClose: 10000 });
        setBookingApartmentId(null);
        setBookingForm({ dateFrom: "", dateTo: "" });
      }
    } catch (err) {
      toast.error("Booking/payment error!", { autoClose: 10000 });
    } finally {
      setBookingLoading(false);
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

  function getFeatureBadges(features) {
  if (!features) return null;
  return Object.keys(features)
    .filter(key => features[key])
    .map((key, i) =>
      <span
        key={i}
        style={{
          background: "#D6E7EE", 
          color: "#001B48",
          fontWeight: 500,
          fontSize: 15,
          borderRadius: 16,
          padding: "4px 16px",
          boxShadow: "0 1px 4px #e2e8f0",
          marginRight: 8,
          marginBottom: 4,
          display: "inline-block"
        }}
      >
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </span>
    );
}



  if (!hotel) return <div>Loading...</div>;

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
          TRAVEL WITH US
        </span>
      </div>

      {/* Модалка для бронювання */}
      {bookingApartmentId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(36, 67, 96, 0.29)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "20 20 15px 13px #D6E7EE"
          }}
          onClick={() => setBookingApartmentId(null)}
        >
          <div
            className="card px-4 py-3"
            style={{
              minWidth: 370,
              maxWidth: 460,
              width: "90vw",
              borderRadius: 20,
              boxShadow: "0 0 24px 3px #03467244",
              position: "relative",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setBookingApartmentId(null)}
              style={{
                position: "absolute",
                right: 14,
                top: 10,
                border: "none",
                background: "transparent",
                fontSize: 26,
                color: "#bbb",
                cursor: "pointer",
                zIndex: 10,
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h5 className="fw-bold mb-3">
              Book this room{" "}
              <span style={{ fontWeight: 400, color: "#0c5799" }}>
                ({apartments.find(a => a.id === bookingApartmentId)?.name || ""})
              </span>
            </h5>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                handleBooking(bookingApartmentId, bookingForm, paymentType);
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
              <div className="mb-3">
                <label className="form-label">Payment method:</label>
                <select
                  className="form-select"
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Mono">Mono</option>
                  <option value="BankTransfer">Bank Transfer</option>
                </select>
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
        </div>
      )}

      <div className="container py-4">    
      {/* 1. БАНЕР ІНФО (загальне фото + назва + рейтинг + ціна) */}
      <div className="row mb-4">
        <div className="col-12 col-md-8">
          <div className="position-relative" style={{ width: "100%", height: "auto", overflow: "hidden", minHeight: 460, maxHeight: 560, borderRadius: 12, boxShadow: "0 0 5px 3px #D6E7EE" }}>
            {/* Велике фото готелю */}
            <img
              src={hotel.photos?.[photoIndex]?.blobUrl || "/noimage.png"}
              alt={hotel.name}
              style={{ width: "100%", height: "auto", maxHeight: 560, minHeight: 460, objectFit: "cover", borderRadius: 12 }}
            />

            <div
              className="position-absolute top-0 start-0 w-100 px-3 pt-3 d-flex flex-wrap gap-2"
              style={{ zIndex: 2 }}
            >
              {getFeatureBadges(hotel.features)}
            </div>


            {/* Назва, рейтинг та ціна поверх фото */}
            <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: "rgba(0,0,0,0.05)" }}>
              <div className="d-flex align-items-center mb-2">
                <span className="badge me-2" style={{ fontSize: 17, background: "#fff", color: "#BF9D78" }}>
                  <img src="/images/reitingstar.png" alt="Star" style={{ width: 16, height: 16, marginRight: 7 }} />
                  {hotel.rating?.generalRating?.toFixed(1) ?? "—"}
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
        <div className="col-12 col-md-4 mt-4 mt-md-0">

          {/* Гугл карта з позначкою місця готеля*/}
          <div className="card mb-3" style={{ borderRadius: 12, padding: 0, margin: '0 auto', boxShadow: "0 0 5px 3px #D6E7EE"  }}>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ width: "100%", minHeight: 220, maxHeight:250, borderRadius: 12, overflow: "hidden", margin: 0 }}>
                <iframe
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${hotel.geolocation.latitude},${hotel.geolocation.longitude}&z=13&output=embed`}
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
              width: "100%",
              minHeight: 220, 
              maxHeight:300,
              margin: "0 auto"
            }}
          >
            {/* Top row: Star + rating + Excellent + reviews */}
            <div className="d-flex align-items-center justify-content-center mb-2" style={{ gap: 10 }}>
              <img src="/images/reitingstar-orange.png" alt="star" style={{ width: 24, height: 24, marginRight: 6 }} />
              <span style={{ color: "#FE7C2C", fontWeight: 700, fontSize: 24, marginRight: 6 }}>
                {hotel.rating?.generalRating?.toFixed(1) ?? "—"}
              </span>
              <span style={{ fontWeight: 300, color: "#001B48", fontSize: 12 }}>
                {hotel.rating?.generalRating >= 9 ? "Excellent rating" : hotel.rating?.generalRating >= 8 ? "Very good" : "No rating"}
              </span>
              <a href="#reviews"
                style={{marginLeft: 10, color: "#0074e4", fontWeight: 300, fontSize: 12, textDecoration: "underline" }}>
                {hotel.rating?.reviewCount ?? 0} reviews
              </a>
            </div>

            {/* Список категорій */}
            <div className="row" style={{ marginTop: 14 }}>
              <div className="col-6" style={{ padding: "0 12px" }}>
                <RatingCategory label="Staff" value={hotel.rating?.staffRating ?? 0} />
                <RatingCategory label="Purity" value={hotel.rating?.purityRating ?? 0} />
                <RatingCategory label="Price/quality ratio" value={hotel.rating?.priceQualityRating ?? 0} />
              </div>
              <div className="col-6" style={{ padding: "0 12px" }}>
                <RatingCategory label="Comfort" value={hotel.rating?.comfortRating ?? 0} />
                <RatingCategory label="Facilities" value={hotel.rating?.facilitiesRating ?? 0} />
                <RatingCategory label="Location" value={hotel.rating?.locationRating ?? 0} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. ОПИС */}
      <div className="row mb-4">
      <div className="col-md-6">
        {/* Вкладки */}
        <div className="mb-3 d-flex gap-2 flex-wrap" style={{ marginBottom: "40px" }}>
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
              <div className="mb-2" style={{ color: "#22614D", fontWeight: 500 }}>
                <i className="bi bi-geo-alt" style={{color: "#22614D"}} />{" "}
                {hotel.geolocation?.address
                  ?.split(",")
                  ?.filter((_, i) => [0, 1, 3, 6].includes(i)) // 0 - номер, 1 - вулиця, 3 - місто, 6 - країна
                  ?.join(", ")}
              </div>
              <div style={{ fontSize: 24 }}>{hotel.description}</div>
            </>
          )}
          {activeTab === "services" && hotel.features && (
            <ul style={{ fontSize: 24, marginBottom: 0, listStyleType: "disc", paddingLeft: 20 }}>
              {Object.entries(hotel.features)
                .filter(([key, value]) => value)
                .map(([key], i) => (
                  <li key={i}>
                    {ESTABLISHMENT_FEATURE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                  </li>
                ))}
            </ul>
          )}

          {activeTab === "terms" && (
            <div style={{ fontSize: 15 }}>
              {apartments.length === 0 && <div className="text-muted">No apartments available.</div>}
              {apartments.map((apt, i) => (
                <div key={apt.id} className="mb-4 p-3" style={{ borderBottom: "1px solid #ccc" }}>
                  <div style={{fontSize: 20}}>🛏 {apt.name}</div>
                  <div><strong>Capacity:</strong> {apt.capacity} persons</div>
                  <div><strong>Area:</strong> {apt.area ? `${apt.area} m²` : "N/A"}</div>
                  <div><strong>Description:</strong> {apt.description}</div>
                  <div><strong>Features:</strong>
                    <ul style={{ marginTop: 6 }}>
                      {Object.entries(apt.features || {})
                        .filter(([_, v]) => v)
                        .map(([k], j) => (
                          <li key={j}>
                            {APARTMENT_FEATURE_LABELS[k] || k.charAt(0).toUpperCase() + k.slice(1)}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div><strong>Price:</strong> {apt.price} $ / night</div>
                </div>
              ))}
            </div>
          )}


        </div>
      </div>

      {/* Rooms – картки номерів */}
      <div className="col-md-6 mt-4 mt-md-0" style={{ fontSize: 15 }}>
        {apartments.length === 0 && <div className="text-muted">No rooms found</div>}
        {apartments.map((apt) => {
          const currentPreviewIdx = previewIndexes[apt.id] || 0;
          const mainPhoto = apt.photos?.[currentPreviewIdx];
          const thumbnails = (apt.photos || []).filter((_, i) => i !== currentPreviewIdx).slice(0, 3);

          return (
            <React.Fragment key={apt.id}>
              <div className="card mb-4" style={{ borderRadius: 16, overflow: "hidden", padding: 0, boxShadow: "0 0 5px 3px #D6E7EE" }}>
                <div className="d-flex flex-row" style={{ minHeight: 230 }}>
                  <div style={{ width: 220, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                    {/* Головне фото */}
                    <img
                      src={mainPhoto?.blobUrl || "/noimage.png"}
                      alt={apt.name}
                      style={{
                        width: 200,
                        height: 140,
                        objectFit: "cover",
                        borderRadius: 10,
                        margin: "20px 0 10px 10px",
                      }}
                    />
                    {/* favorite поверх фото */}
                    <button
                      style={{
                        position: "absolute",
                        top: 30,
                        right: 20,
                        background: "rgba(255,255,255,1)", borderRadius: "50%",
                        border: "none", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 12px #eee", color: "#BF9D78", zIndex: 5
                      }}
                      onClick={() => toggleApartmentFavorite({
                        user,
                        favorites,
                        setFavorites,
                        apartmentId: apt.id,
                        setFavoriteApartments,
                      })}
                      title={favorites.find(f => f.apartment && f.apartment.id === apt.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                      }
                    >
                      <img
                        src="/images/favorite.png"
                        alt="favorite"
                        style={{
                          width: 28,
                          filter: favorites.find(f => f.apartment && f.apartment.id === apt.id) ? "none" : "grayscale(1)"
                        }}
                      />
                    </button>
                    {/* Мініатюри */}
                    <div className="d-flex" style={{ gap: 2 }}>
                      {thumbnails.map((photo, idx) => {
                        const realIdx = apt.photos.findIndex(p => p.id === photo.id);
                        return (
                          <img
                            key={photo.id || idx}
                            src={photo.blobUrl}
                            alt=""
                            style={{
                              width: 65,
                              height: 50,
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
                      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, fontSize: 18, color: "#001B48" }}>
                          {apt.name}
                        </div>
                        
                        <span style={{ fontWeight: 500, fontSize: 15, color: "#BF9D78", display: "flex", alignItems: "center" }}>
                          <img src="/images/reitingstar.png" alt="Star" style={{ width: 14, height: 14, marginRight: 3 }} />
                          {apt.rating?.generalRating !== undefined && apt.rating?.generalRating !== null
                            ? apt.rating.generalRating.toFixed(1)
                            : "—"}
                          {" "}
                          ({apt.rating?.reviewCount || 0})
                        </span>
                      </div>
                      <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>
                        {apt.description}
                      </div>
                      <div className="text-secondary mb-2" style={{ fontSize: 13, color: "#001B48" }}>
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
                        onClick={() => {
                          setBookingApartmentId(apt.id);
                          //setBookingForm({ dateFrom: "", dateTo: "" }); // очищаємо форму                          
                        }}
                      >
                        Book now
                      </button>
                    </div>
                  </div>
                </div>
              </div>        
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

