import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef  } from "react";
import { axiosInstance } from "../api/axios";
import { getApartmentAvailability } from "../api/bookingApi"
import { getAllReviews } from "../api/reviewApi";
import BookingBannerForm from '../components/BookingBannerForm';
import { getUserFavorites } from "../api/favoriteApi";
import { isHotelFavorite, toggleHotelFavorite } from "../utils/favoriteUtils";
import {
  ESTABLISHMENT_FEATURE_LABELS,
  APARTMENT_FEATURE_LABELS, decodeFlagsUser 
} from '../utils/enums';
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getApiErrorMessage } from "../utils/apiError";

const fmt1 = v => (v != null && !Number.isNaN(Number(v)) ? Number(v).toFixed(1) : "—");
const fmt1Blank = v => (v != null && !Number.isNaN(Number(v)) ? Number(v).toFixed(1) : "");



const HotelDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [search, setSearch] = useState("");
  const [bookingApartmentId, setBookingApartmentId] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    dateFrom: "",
    dateTo: ""
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [favorites, setFavorites] = useState([]);
  const hotelIsFavorite = isHotelFavorite(favorites, Number(id));
  const [photoIndex, setPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("about");
  const [previewIndexes, setPreviewIndexes] = useState({});
  const [unavailableDates, setUnavailableDates] = useState([]);
  const disabledDates = unavailableDates.map((d) => {
    const nd = new Date(d);
    return new Date(nd.getFullYear(), nd.getMonth(), nd.getDate());
  });
  const [reviews, setReviews] = useState([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [modalReviews, setModalReviews] = useState([]);

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
  }, [id]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const favs = await getUserFavorites();
        setFavorites(favs);        
      } catch (e) {
        console.error("Failed to load favorites:", e);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!id) return;
    let ids = JSON.parse(localStorage.getItem("recentHotels") || "[]");
    ids = [Number(id), ...ids.filter(i => i !== Number(id))].slice(0, 6);
    localStorage.setItem("recentHotels", JSON.stringify(ids));
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const all = await getAllReviews();
        const hotelApartmentIds = (apartments || []).map(a => a.id);
        const filtered = all.filter(r =>
          hotelApartmentIds.includes(r.booking?.apartment?.id)
        );
        setReviews(filtered);
      } catch (e) {
        console.error("Error loading reviews:", e);
        setReviews([]);
      }
    };
    if (apartments.length) fetchReviews();
  }, [apartments]);

  useEffect(() => {
    if (!bookingApartmentId) return;

    const form = JSON.parse(localStorage.getItem("bookingForm") || "{}");
    setBookingForm({
      dateFrom: form.checkIn ? toInputDate(form.checkIn) : "",
      dateTo:   form.checkOut ? toInputDate(form.checkOut) : ""
    });

    getApartmentAvailability(bookingApartmentId)
      .then(data => setUnavailableDates(data?.unavailableDates || []))
      .catch(() => setUnavailableDates([]));
  }, [bookingApartmentId]);


  const openApartmentReviews = (apartmentId) => {
    const list = reviews.filter(r => r.booking?.apartment?.id === apartmentId);
    setModalReviews(list);
    setShowReviewsModal(true);
  };

  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr; 
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; 
  };

  const toLocalDateString = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const parseLocalDate = (s) => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const isDateUnavailable = (from, to) => {
    const check = (d) => unavailableDates.some(u => 
      (new Date(u)).toISOString().slice(0, 10) === (new Date(d)).toISOString().slice(0, 10)
    );
    let cur = new Date(from);
    let end = new Date(to);
    while (cur < end) {
      if (check(cur)) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  const handleBooking = async (apartmentId) => {

    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      currentUser = null;
    }
     if (!currentUser?.id || !localStorage.getItem("token")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      toast.warn("To book a room, log in to your account!", { autoClose: 10000 });
      return;
    }
    const stored = JSON.parse(localStorage.getItem("bookingForm") || "{}");
    const rawFrom = bookingForm.dateFrom || stored.checkIn || "";
    const rawTo   = bookingForm.dateTo   || stored.checkOut || "";
    const df = rawFrom.slice(0, 10);
    const dt = rawTo.slice(0, 10);
     if (!df || !dt) {
      toast.warn("Please select dates for booking.", { autoClose: 10000 });
      return;
    }
    if (new Date(dt) <= new Date(df)) {
      toast.warn("Check-out must be after check-in.", { autoClose: 8000 });
      return;
    }
     if (isDateUnavailable(df, dt)) {
      toast.error("These dates are already booked for this room. Please select other dates.", { autoClose: 12000 });
      return;
    }

    try {
      const isoFrom = `${df}T00:00:00`;
      const isoTo   = `${dt}T00:00:00`;

      const apt = apartments.find(a => a.id === apartmentId);
      const nights = Math.max(1, Math.ceil((new Date(isoTo) - new Date(isoFrom)) / 86400000));
      const amount = (apt?.price || 0) * nights;

      localStorage.setItem("pendingBooking", JSON.stringify({
        hotelId: Number(id),
        apartmentId,
        dateFrom: isoFrom,
        dateTo: isoTo,
        amount
      }));

      setBookingApartmentId(null);
      navigate("/booking?preview=1");
    } catch (err) {
      const msg = getApiErrorMessage(err);
      toast.error(<div style={{ whiteSpace: "pre-wrap" }}>{msg}</div>, { autoClose: 12000 });
    }
  };  

  const RatingCategory = ({ label, value }) => (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: 12, fontWeight: 500 }}>
        <span>{label}</span>
        <span style={{ color: "#001B48", fontWeight: 600 }}>{fmt1(value)}</span>
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

      <div className="container py-4">    
      {/* 1. БАНЕР ІНФО (загальне фото + назва + рейтинг + ціна) */}
      <div className="row mb-4">
        <div className="col-12 col-md-8">
          <div className="position-relative" style={{ width: "100%", height: "auto", overflow: "hidden", minHeight: 460, maxHeight: 560, borderRadius: 12, boxShadow: "0 0 5px 3px #D6E7EE" }}>
            {/* Велике фото готелю */}
            <img
              src={hotel.photos?.[photoIndex]?.blobUrl || "/noimage.png"}
              alt={hotel.name}
              style={{ width: "100%", height: "auto", maxHeight: 600, minHeight: 520, objectFit: "cover", borderRadius: 12 }}
            />

            {/* Вивід Services з іконками */}
            <div
              className="position-absolute top-0 start-0 w-100 px-3 pt-3 d-flex flex-wrap gap-2"
              style={{ zIndex: 2, marginRight: 20 }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {(() => {
                  let featureNames = [];
                  if (typeof hotel?.features === "number") {
                    featureNames = decodeFlagsUser(hotel.features, ESTABLISHMENT_FEATURE_LABELS);
                  } else if (hotel?.features && typeof hotel.features === "object") {
                    featureNames = Object.keys(ESTABLISHMENT_FEATURE_LABELS).filter(k =>
                      hotel.features[k.charAt(0).toLowerCase() + k.slice(1)]
                    );
                  }

                  return featureNames.map((featureName, index) => (
                    <div key={index} 
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
                      display: "inline-block"  }}>
                      <img
                        src={`/images/features/${featureName}.png`}
                        alt={featureName}
                        style={{ width: 18, height: 18, marginRight: 5 }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      {featureName.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Кнопка favorite */}
               <button
                style={{
                  position: "absolute", top: 18, right: 18, zIndex: 4,
                  background: "rgba(255,255,255,0.95)", borderRadius: "50%",
                  border: "none", width: 40, height: 40, display: "flex",
                  alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px #eee",
                }}
                onClick={() => {
                    const token = localStorage.getItem("token");
                    if (!user?.id || !token) {
                      toast.info("Sign in to manage favorites.");
                      return;
                    }
                    toggleHotelFavorite({
                      user,
                      favorites,
                      setFavorites,
                      establishmentId: Number(id),
                    });
                  }}
                title={hotelIsFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <img
                  src="/images/favorite.png"
                  alt="favorite"
                  style={{ width: 40, filter: hotelIsFavorite ? "none" : "grayscale(1)" }}
                />
              </button>

            {/* Назва, рейтинг та ціна поверх фото */}
            <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: "rgba(0,0,0,0.05)" }}>
              <div className="d-flex align-items-center mb-2">
                <span className="badge me-2" style={{ fontSize: 17, background: "#fff", color: "#BF9D78" }}>
                  <img src="/images/reitingstar.png" alt="Star" style={{ width: 16, height: 16, marginRight: 7 }} />
                  {fmt1(hotel?.rating?.generalRating)}
                </span>            
              </div>
              <h2 className="text-white mb-1" style={{ fontWeight: 700 }}>{hotel.name}</h2>
              
              <div className="d-flex space-between mb-2">
                <span style={{ background: "#fff", borderRadius: 10, padding: "3px 12px" }}>
              <span style={{ fontWeight: 400, fontSize: 15, color: "#02457A" }}>Start from </span>
              <span style={{ fontWeight: 700, fontSize: 24, color: "#02457A" }}>
                {hotel?.minApartmentPrice}
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
              maxHeight:250,
              margin: "0 auto"
            }}
          >
            {/* Star + rating + Excellent + reviews */}
            <div className="d-flex align-items-center justify-content-center mb-2" style={{ gap: 10 }}>
              <img src="/images/reitingstar-orange.png" alt="star" style={{ width: 24, height: 24, marginRight: 6 }} />
              <span style={{ color: "#FE7C2C", fontWeight: 700, fontSize: 24, marginRight: 6 }}>
                {fmt1(hotel?.rating?.generalRating)}
              </span>
              <span style={{ fontWeight: 300, color: "#001B48", fontSize: 12 }}>
                {typeof hotel.rating?.generalRating === "number"
                  ? hotel.rating.generalRating >= 8
                    ? "Excellent rating"
                    : hotel.rating.generalRating >= 6
                    ? "Very good"
                    : "No rating"
                  : "No rating"}
              </span>
              <a
                href="#reviews"
                style={{
                  marginLeft: 10,
                  color: "#0074e4",
                  fontWeight: 300,
                  fontSize: 12,
                  textDecoration: "underline"
                }}
                onClick={e => {
                  e.preventDefault();
                  setModalReviews(reviews);
                  setShowReviewsModal(true);
                }}
              >
                {hotel.rating?.reviewCount ?? 0} reviews
              </a>
            </div>


            {/* Список категорій */}
            <div className="row">
              <div className="col-6" style={{ padding: "20px 12px" }}>
                <RatingCategory label="Staff" value={hotel.rating?.staffRating ?? 0} />
                <RatingCategory label="Purity" value={hotel.rating?.purityRating ?? 0} />
                <RatingCategory label="Price/quality ratio" value={hotel.rating?.priceQualityRating ?? 0} />
              </div>
              <div className="col-6" style={{ padding: "20px 12px" }}>
                <RatingCategory label="Comfort" value={hotel.rating?.comfortRating ?? 0} />
                <RatingCategory label="Facilities" value={hotel.rating?.facilitiesRating ?? 0} />
                <RatingCategory label="Location" value={hotel.rating?.locationRating ?? 0} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="row mb-4">

        {/* 3. ОПИС */}
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
                    ?.filter((_, i) => [0, 1, 3, 6].includes(i))
                    ?.join(", ")}
                </div>
                <div style={{ fontSize: 24 }}>{hotel.description}</div>
              </>
            )}
            {activeTab === "services" && hotel.features && (
              <div className="d-flex flex-column gap-2">
                {(() => {
                  let featureNames = [];
                  if (typeof hotel?.features === "number") {
                    featureNames = decodeFlagsUser(hotel.features, ESTABLISHMENT_FEATURE_LABELS);
                  } else if (hotel?.features && typeof hotel.features === "object") {
                    featureNames = Object.keys(ESTABLISHMENT_FEATURE_LABELS).filter(k =>
                      hotel.features[k.charAt(0).toLowerCase() + k.slice(1)]
                    );
                  }

                  if (featureNames.length === 0) {
                    return <span className="text-muted">No services listed.</span>;
                  }

                  return featureNames.map((featureName) => (
                    <div
                      key={featureName}
                      className="d-flex align-items-center px-3 py-2 rounded border bg-light"
                      style={{ fontSize: 16, color: "#001B48" }}
                    >
                      <img
                        src={`/images/features/${featureName}.png`}
                        alt={featureName}
                        style={{ width: 20, height: 20, marginRight: 8 }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      {featureName.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                  ));
                })()}
              </div>
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
                  {/* Apartment зручності */}
                  {apt.features && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 10px 8px" }}>
                      {(() => {
                        let names = [];
                        if (typeof apt.features === "number") {
                          names = decodeFlagsUser(apt.features, APARTMENT_FEATURE_LABELS);
                        } else if (typeof apt.features === "object") {
                          names = Object.keys(APARTMENT_FEATURE_LABELS).filter(k =>
                            apt.features[k.charAt(0).toLowerCase() + k.slice(1)]
                          );
                        }

                        return names.map((name) => (
                          <div
                            key={name}
                            className="d-inline-flex align-items-center px-2 py-1 rounded border bg-light"
                            style={{ fontSize: 10, color: "#001B48" }}
                          >
                            <img
                              src={`/images/apartment-features/${name}.png`}
                              alt={name}
                              style={{ width: 16, height: 16, marginRight: 6 }}
                              onError={(e) => {
                                const fallback = `/images/features/${name}.png`;
                                if (!e.currentTarget.dataset.tried) {
                                  e.currentTarget.dataset.tried = "1";
                                  e.currentTarget.src = fallback;
                                } else {
                                  e.currentTarget.style.display = "none";
                                }
                              }}
                            />
                            {name.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                        ));
                      })()}
                    </div>
                  )}

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
                      
                      {/* Мініатюри */}
                      <div className="d-flex" style={{ gap: 2, marginLeft: 10 }}>
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
                          
                          <span style={{ fontWeight: 500, fontSize: 12, color: "#BF9D78", display: "flex", alignItems: "center", gap: 6 }}>
                            <img src="/images/reitingstar.png" alt="Star" style={{ width: 14, height: 14 }} />
                            {fmt1(apt?.rating?.generalRating)}
                            <button
                              type="button"
                              className="btn btn-link p-0"
                              style={{ fontSize: 12 }}
                              onClick={() => openApartmentReviews(apt.id)}
                              title="Show reviews for this room"
                            >
                              (Reviews: {apt.rating?.reviewCount ?? reviews.filter(r => r.booking?.apartment?.id === apt.id).length})
                            </button>
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
                          ${apt.price} <span style={{ fontWeight: 400, fontSize: 14 }}> / night</span>
                        </div>
                        
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ borderRadius: 8, fontWeight: 600, fontSize: 14, padding: "6px 22px" }}
                          onClick={() => {
                            setBookingApartmentId(apt.id);                        
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
                handleBooking(bookingApartmentId, bookingForm);
              }}
            >
              <div className="row mb-2">
                <div className="col">
                  <label className="form-label">Date from</label>
                  <DatePicker
                    selected={parseLocalDate(bookingForm.dateFrom)}
                    onChange={date => setBookingForm(f => ({ ...f, dateFrom: date ? toLocalDateString(date) : "" }))}
                    excludeDates={disabledDates}
                    minDate={new Date()}
                    placeholderText="Select start date"
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                  />
                </div>
                <div className="col">
                  <label className="form-label">Date to</label>
                  <DatePicker
                    selected={parseLocalDate(bookingForm.dateTo)}
                    onChange={date => setBookingForm(f => ({ ...f, dateTo: date ? toLocalDateString(date) : "" }))}
                    excludeDates={disabledDates}
                    minDate={bookingForm.dateFrom ? parseLocalDate(bookingForm.dateFrom) : new Date()}
                    placeholderText="Select end date"
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                  />
                </div>
              </div>              
              <div className="d-flex justify-content-center gap-3">
                <button className="btn btn-success" disabled={bookingLoading}>Confirm booking</button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setBookingApartmentId(null)}
                  disabled={bookingLoading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* модалка виводу відгуку */}
      {showReviewsModal && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(36,67,96,0.24)",
          zIndex: 1300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onClick={() => setShowReviewsModal(false)}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            minWidth: 380,
            maxWidth: 550,
            maxHeight: "80vh",
            overflowY: "auto",
            padding: "34px 28px 24px 28px",
            boxShadow: "0 12px 48px #446e958f",
            position: "relative"
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="btn btn-outline-secondary btn-sm"
            style={{ position: "absolute", right: 16, top: 12, borderRadius: 8, fontWeight: 600 }}
            onClick={() => setShowReviewsModal(false)}
          >×</button>
          <h5 style={{ fontWeight: 700, marginBottom: 16 }}>Reviews</h5>
          {reviews.length === 0 && <div className="text-muted">No reviews yet.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {modalReviews.map((r, i) => (
              <div key={r.id || i} style={{
                borderBottom: "1px solid #eee",
                paddingBottom: 10,
                marginBottom: 8
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  {r.booking?.customer?.username || "Anonymous"}
                  <span style={{ marginLeft: 10, color: "#FE7C2C" }}>
                    {fmt1Blank(r?.rating)}
                  </span>
                </div>
                <div style={{ fontSize: 15 }}>{r.text}</div>
                {Array.isArray(r.photos) && r.photos.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {r.photos.map((photo, idx) => (
                      <img
                        key={photo.id || idx}
                        src={photo.blobUrl || "/noimage.png"}
                        alt=""
                        style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 7, border: "1px solid #ddd" }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

  </div>
  );
};

export default HotelDetails;

