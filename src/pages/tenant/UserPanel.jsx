import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser, updateUser, logout  } from "../../store/slices/userSlice";
import { getBookingById, deleteBooking, updateBooking } from "../../api/bookingApi";
import { getUserFavorites, removeFavorite  } from "../../api/favoriteApi";
import { getApartmentById } from "../../api/apartmentApi";
import { toast } from 'react-toastify';
import { uploadUserPhoto, updateUserPassword, updateUserDetails } from "../../api/userApi";
import AddComment from "../../components/AddComment";
import { decodeFlagsUser, 
  ESTABLISHMENT_FEATURE_LABELS,  
  getEstablishmentTypeName, 
  APARTMENT_FEATURE_LABELS } from "../../utils/enums";


const UserPanel = () => {
  const user = useSelector(s => s.user.user);
  const dispatch = useDispatch();
  if (!user) return null;

  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [apartmentMap, setApartmentMap] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    photoBase64: "",
    photoPreview: user?.photoUrl || "",
  });
  const [editModal, setEditModal] = useState({
    show: false,
    booking: null,
    dateFrom: "",
    dateTo: ""
  });
  const [addReviewModal, setAddReviewModal] = useState({ show: false, booking: null });
  const [pwModal, setPwModal] = useState({
   show: false,
   current: "",
   next: "",
   confirm: "",
   loading: false,
   error: ""
 });
 const fmt1 = v => (v != null && !Number.isNaN(Number(v)) ? Number(v).toFixed(1) : "—");


  useEffect(() => {
    setLoading(true);
    if (!user?.id) return;
    const fetchData = async () => {
      try {        
        const favData = await getUserFavorites();
        const bookingIds = (user?.bookings || [])
          .map(b => (typeof b === "number" ? b : b?.id))
          .filter(Boolean);
        const bookData = bookingIds.length
          ? await Promise.all(bookingIds.map(id => getBookingById(id)))
          : [];
        setBookings(bookData);
        setFavorites(favData);
        const ids = [...new Set(bookData.map(b => b.apartmentId))].filter(Boolean);
        await loadApartments(ids);
      } catch (err) {
        console.error("Loading error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id, user?.bookings]);

  const loadApartments = async (ids) => {
    const newMap = {};
    for (let id of ids) {
      try {
        const apt = await getApartmentById(id);
        newMap[id] = apt;
      } catch (err) {
        // handle error
      }
    }
    setApartmentMap(newMap);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        username: (editedUser.username || "").trim(),
        email: (editedUser.email || "").trim(),
        phoneNumber: (editedUser.phoneNumber || "").trim(),
        bio: (editedUser.bio || "").trim?.() || ""
      };
      await updateUserDetails(payload);

      if (editedUser.photoBase64) {
        await uploadUserPhoto(editedUser.photoBase64);
      }
      
      const nextUser = {
        ...current,
        username: payload.username,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        photoUrl: editedUser.photoPreview || current.photoUrl
      };
      dispatch(setUser(nextUser));
      setIsEditing(false);
      toast.success("Profile saved!", { autoClose: 3000 });
    } catch (err) {
      console.error(err?.response || err);
      toast.error("Error saving profile!", { autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      username: user?.username || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    });
    setIsEditing(false);
  };

  const handleDeleteFavorite = async (favoriteId) => {
    await removeFavorite(favoriteId);
    setFavorites(favorites.filter((f) => f.id !== favoriteId));
    dispatch(updateUser({
      favorites: (user.favorites || []).filter(id => id !== favoriteId)
    }));
    toast.success("Removed from favorites", { autoClose: 4000 });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditedUser(prev => ({
        ...prev,
        photoBase64: ev.target.result,
        photoPreview: ev.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  function getTotalPrice(booking) {
    if (!booking || !booking.dateFrom || !booking.dateTo) return "----";
    const price =
      booking.apartment?.price ||
      apartmentMap[booking.apartmentId]?.price ||
      0;
    if (!price) return "----";
    const from = new Date(booking.dateFrom);
    const to = new Date(booking.dateTo);
    const nights = Math.max(
      1,
      Math.ceil((to - from) / (1000 * 60 * 60 * 24))
    );
    return price * nights;
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      dispatch(updateUser({
        bookings: (user.bookings || []).filter(id => id !== bookingId)
      }));
      toast.success("Booking cancelled successfully!", { autoClose: 4000 });
    } catch (err) {
      toast.error("Unable to cancel reservation!", { autoClose: 4000 });
    }
  };

  const openEditModal = (booking) => {
    setEditModal({
      show: true,
      booking,
      dateFrom: booking.dateFrom?.slice(0, 10), // формат YYYY-MM-DD
      dateTo: booking.dateTo?.slice(0, 10)
    });
  };

  const closeEditModal = () => {
    setEditModal({ show: false, booking: null, dateFrom: "", dateTo: "" });
  };

  const handleEditBooking = async () => {
    if (!editModal.booking) return;
    try {
      const fmt = (d) => (d && d.length === 10 ? `${d}T00:00:00` : d);

      await updateBooking(editModal.booking.id, {
        dateFrom: fmt(editModal.dateFrom),
        dateTo: fmt(editModal.dateTo),
        customerId: user.id,
        apartmentId: editModal.booking.apartmentId || editModal.booking.apartment?.id,
        additionalRequests: editModal.booking.additionalRequests || "",
        paymentType: editModal.booking.paymentType ?? undefined
      });

      setBookings(prev =>
        prev.map(b =>
          b.id === editModal.booking.id
            ? { ...b, dateFrom: editModal.dateFrom, dateTo: editModal.dateTo }
            : b
        )
      );
      toast.success("Booking updated!", { autoClose: 4000 });
      closeEditModal();
    } catch (err) {
      console.error(err?.response || err);
      toast.error("Unable to update reservation!", { autoClose: 4000 });
    }
  };

  const getNights = (fromStr, toStr) => {
    if (!fromStr || !toStr) return 0;
    const from = new Date(fromStr);
    const to   = new Date(toStr);
    const diffMs = to - from;
    const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, nights);
  };

  // ПАРОЛЬ
  const SPECIALS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const validatePassword = (pwd, username) => {
    const errors = [];
      if (!/[A-Z]/.test(pwd)) errors.push("contain at least one uppercase letter");
      if (!/[a-z]/.test(pwd)) errors.push("contain at least one lowercase letter");
      if (!/\d/.test(pwd)) errors.push("contain at least one number");
      if (!new RegExp(`[${escapeRegExp(SPECIALS)}]`).test(pwd))
        errors.push("contain at least one special character");
      if (/(.)\1\1/.test(pwd))
        errors.push("contain no more than 2 consecutive identical characters");
      if (username && pwd.toLowerCase().includes(username.toLowerCase()))
        errors.push("not contain the username");
      return errors;
    };

  const handleChangePassword = async () => {
    if (!pwModal.current || !pwModal.next) {
      return setPwModal(m => ({ ...m, error: "Please fill in both fields." }));
    }
    if (pwModal.next.length < 6) {
      return setPwModal(m => ({ ...m, error: "New password must be at least 6 characters." }));
    }
    if (pwModal.next !== pwModal.confirm) {
      return setPwModal(m => ({ ...m, error: "Passwords do not match." }));
    }

    const username = user?.username || user?.email?.split("@")[0];
    const vErrors = validatePassword(pwModal.next, username);
      if (vErrors.length) {
        return setPwModal(m => ({ ...m, error: `Password must ${vErrors.join(", ")}.` }));
      }

      try {
        setPwModal(m => ({ ...m, loading: true, error: "" }));
        await updateUserPassword(pwModal.current, pwModal.next);
        setPwModal({ show: false, current: "", next: "", confirm: "", loading: false, error: "" });
        toast.success("Password changed successfully!", { autoClose: 3000 });
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to change password.";
        setPwModal(m => ({ ...m, loading: false, error: msg }));
        toast.error(msg, { autoClose: 4000 });
      }
    };

  const handleLogout = () => {
      dispatch(logout());
      localStorage.removeItem("user");
      toast.success("You have been logged out", { autoClose: 2000 });
      navigate("/");
    };

  // --- Розбивка бронювань
  const myBookings = bookings.filter(
    (b) => b.customer?.email && user && b.customer.email === user.email
  );
  const upcoming = myBookings.filter((b) => new Date(b.dateTo) > new Date());
  const history = myBookings.filter((b) => new Date(b.dateTo) < new Date());

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString();
  };

  // --- Дані для правої колонки
  const upcomingBooking = upcoming[0] || null;
  const apt = upcomingBooking?.apartment || null;
  const hotel = apt?.establishment || null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(255,255,255,0.97) 0%,
            rgba(255,255,255,0.14) 40%,
            rgba(255,255,255,0) 80%
          ),
          url('/images/signin.png')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "60px 0 40px 0",
        marginTop: "-110px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          padding: "32px 36px 32px 36px",
          width: "100%",
          maxWidth: "98vw",
          height: "100%",
          boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
          marginTop: "60px",
        }}
      >
        
        {/* --- ДВІ КОЛОНКИ --- */}
        <div className="row mt-4" style={{ minHeight: 400 }}>

          {/* ЛІВА КОЛОНКА !!!!!! */}
          <div className="col-12 col-md-6 mb-4 mb-md-0" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            
            {/* 1. Інформація користувача */}
            <div style={{
              background: "#fcfcfc",  //
              borderRadius: 18,
              padding: 24,              
              boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)"   //
            }}>
              <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>Your details</div>
              <div className="d-flex align-items-center gap-3 mb-3">              
                <div>

                  {/*    EDIT    */}
                  {isEditing ? (
                    <>           
                  {/* Full name */}
                  <div style={{ marginBottom: 24 }}>
                    {user?.photoUrl && (
                      <img
                        src={user.photoUrl}
                        alt="User avatar"
                        width={90}
                        height={90}
                        style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid #eee", marginBottom: 12 }}
                      />
                    )}
                    <label style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0e590e", display: "block" }}>
                      Full name
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      style={{
                        borderRadius: 16,
                        fontWeight: 500,
                        border: "1.5px solid #02457A",
                        background: "transparent",
                        minHeight: 44,
                        fontSize: 16,
                        paddingLeft: 16,
                        marginBottom: 6,
                      }}
                      value={editedUser.username}
                      onChange={handleInputChange}
                      placeholder="Full name"
                    />
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0e590e", display: "block" }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      style={{
                        borderRadius: 16,
                        fontWeight: 500,
                        border: "1.5px solid #02457A",
                        background: "transparent",
                        minHeight: 44,
                        fontSize: 16,
                        paddingLeft: 16,
                        marginBottom: 6,
                      }}
                      value={editedUser.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                    />
                    <div style={{ fontSize: 13, color: "#6E7C87", fontWeight: 400, marginTop: 2 }}>
                      A booking confirmation will be sent to this address
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0e590e", display: "block" }}>
                      Telephone number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      className="form-control"
                      style={{
                        borderRadius: 16,
                        fontWeight: 500,
                        border: "1.5px solid #02457A",
                        background: "transparent",
                        minHeight: 44,
                        fontSize: 16,
                        paddingLeft: 16,
                        marginBottom: 6,
                      }}
                      value={editedUser.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                    />
                    {/* User photo upload */}
                    <div style={{ marginBottom: 32 }}>
                      <label style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0e590e", display: "block" }}>
                        Profile photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        style={{borderRadius:16}}
                        onChange={handlePhotoChange}
                      />
                      {editedUser.photoPreview && (
                        <div style={{ marginTop: 10 }}>
                          <img
                            src={editedUser.photoPreview}
                            alt="Profile preview"
                            width={90}
                            height={90}
                            style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }}
                          />
                          <button
                            className="btn btn-primary btn-sm mt-2"
                            style={{ borderRadius: 10, fontWeight: 600, minWidth: 110, marginLeft: 12 }}
                            disabled={!editedUser.photoBase64}
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                await uploadUserPhoto(editedUser.photoBase64);
                                toast.success("Profile photo updated!", { autoClose: 3000 });
                              } catch (err) {
                                console.error("Failed to upload photo", err);
                                toast.error("Failed to upload photo", { autoClose: 4000 });
                              }
                            }}
                          >
                            Save photo
                          </button>
                        </div>
                      )}

                      <button className="btn btn-outline-primary btn-sm" 
                      style={{ minWidth: 280, marginTop: 20, minHeight:50, fontSize: 18, borderRadius: 16 }}                        
                      onClick={() => setPwModal(m => ({ ...m, show: true, error: "" }))}
                      >
                        Change password
                      </button>

                    </div>

                    <div style={{ fontSize: 13, color: "#6E7C87", fontWeight: 400, marginTop: 2 }}>
                      To confirm your level and be able to contact you if necessary
                    </div>
                  </div>

                  {/* --------- Email Confirmation та Save new data --------- */}
                  <div style={{ marginBottom: 22 }}>
                    <div>
                      <input type="checkbox" id="emailConfirm" style={{ accentColor: "#02457A" }} />
                      <label htmlFor="emailConfirm" style={{ marginLeft: 10, fontSize: 16, color: "#02457A", fontWeight: 600 }}>
                        Yes, send me a free email confirmation <span style={{ fontWeight: 400 }}>(recommended)</span>
                      </label>
                      <div style={{ marginLeft: 32, color: "#737373", fontSize: 13, marginBottom: 4 }}>
                        We will send you a link to download our application
                      </div>
                    </div>
                    <div>
                      <input type="checkbox" id="saveData" style={{ accentColor: "#02457A" }} />
                      <label htmlFor="saveData" style={{ marginLeft: 10, fontSize: 16, color: "#02457A", fontWeight: 600 }}>
                        Save new data to account
                      </label>
                    </div>
                  </div>

                  {/* --------- Special Requests --------- */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 700, color: "#207147", fontSize: 19, marginBottom: 8 }}>
                      Tell us about your special requests
                    </div>
                    <div style={{ color: "#555", fontSize: 14, marginBottom: 8 }}>
                      The administration of the accommodation cannot guarantee the fulfillment of special requests, but will do everything possible to ensure this. You can always leave a special request after completing the booking!
                    </div>
                    <label htmlFor="specialRequests" style={{ fontSize: 16, marginBottom: 5, color: "#02457A", display: "block" }}>
                      Please write your requests
                    </label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      rows={3}
                      style={{
                        width: "100%",
                        border: "1.5px solid #02457A",
                        borderRadius: 16,
                        fontSize: 15,
                        padding: 12,
                        resize: "vertical",
                        background: "transparent",
                        color: "#001B48"
                      }}
                      placeholder="Write here..."
                    />
                  </div>


                  {/* Buttons */}
                  <div className="d-flex gap-2" style={{ marginTop: 12 }}>
                    <button className="btn btn-sm" style={{ minWidth: "49%", background: '#02457A', color: 'white' }} onClick={handleSave}>
                      Save
                    </button>
                    <button className="btn btn-outline-primary btn-sm" style={{ minWidth: "49%" }} onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>

                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 16 }}>
                        <span style={{ fontWeight: 400 }}>Full name:</span>{" "}
                        <span style={{ fontWeight: 700 }}>{user?.username}</span>
                      </div>
                      <div style={{ fontSize: 16, marginBlockStart: 20 }}>
                        <span style={{ fontWeight: 400 }}>Email:</span>{" "}
                        <span style={{ fontWeight: 700 }}>{user?.email}</span>
                      </div>
                      <div style={{ fontSize: 16, marginBlockStart: 20 }}>
                        <span style={{ fontWeight: 400 }}>Phone number:</span>{" "}
                        <span style={{ fontWeight: 700 }}>{user?.phoneNumber}</span>
                      </div>
                      
                      <button
                        className="btn btn-outline-primary btn-sm mt-4"
                        style={{ borderRadius: 12, fontWeight: 600, minWidth: 250 }}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit personal information
                      </button>

                      <button
                        className="btn btn-danger btn-sm mt-4"
                        style={{ borderRadius: 12, fontWeight: 600, minWidth: 250, marginLeft: 20 }}
                        onClick={handleLogout}
                      >
                        Log Out
                      </button>

                      
                    </>
                  )}
                </div>
              </div>            
            </div>
            
            
            {/* --- Блок "Favorites" --- */}
              <div
                style={{
                  background: "#fcfcfc",
                  borderRadius: 18,
                  padding: 24,
                  marginBottom: 24,
                  minHeight: 120,
                  boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.15)"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: "#183E6B" }}>
                  Your favorite hotels
                </div>
                {favorites.length === 0 ? (
                  <div className="text-muted">No favorites found</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {favorites.map((f) => {
                      const hotel = f.establishment;
                      return (
                        <div
                          key={f.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderRadius: 14,
                            padding: "14px 18px",
                            background: "#f3f8fe",
                            border: "1px solid #e1ecfa",
                            marginBottom: 2,
                            cursor: "pointer",
                          }}
                          onClick={() => hotel?.id && navigate(`/hotels/${hotel.id}`)}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                              {hotel?.photos?.[0]?.blobUrl ? (
                                <img
                                  src={hotel.photos[0].blobUrl}
                                  alt={hotel.name}
                                  style={{
                                    width: 120,
                                    height: 100,
                                    objectFit: "cover",
                                    borderRadius: 12,
                                    marginRight: 10,
                                    border: "1.5px solid #eee",
                                    background: "#f3f3f3",
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: 34, marginRight: 10 }}>🏨</span>
                              )}
                              <span style={{ fontWeight: 600, color: "#02457A", fontSize: 24 }}>
                                {hotel?.name || `Hotel ${hotel?.id ?? ""}`}
                              </span>
                            </div>

                            <div className="text-muted" style={{ fontSize: 13 }}>
                              {hotel?.geolocation?.address || hotel?.address || ""}
                            </div>
                          </div>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            style={{
                              fontWeight: 600,
                              minWidth: 75,
                              borderRadius: 10,
                              marginLeft: 10,
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteFavorite(f.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

          </div>

          

          {/* ПРАВА КОЛОНКА !!!!!!!! */}
          <div className="col-12 col-md-6 d-flex flex-column gap-3">
            {upcoming.length === 0 ? (
              <div style={{
                background: "#fcfcfc",
                borderRadius: 18,
                padding: 24,
                minHeight: 120,
                boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)",
                marginBottom: 18,
              }}>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your upcoming hotels</div>
                <div className="text-muted">Here will be shown your next hotel</div>
              </div>
            ) : (
              // БЛОК З МАЙБУТНІМИ БРОНЮВАННЯМИ
              upcoming.map((booking, idx) => {
                const apt = booking.apartment;
                const hotel = apt?.establishment;
                const now = new Date();
                const canAddReview = new Date(booking.dateFrom) <= now;
                return (
                  <div key={booking.id} style={{ marginBottom: 32 }}>                    
                    <div style={{
                      background: "#fcfcfc",
                      borderRadius: 18,
                      padding: 24,
                      minHeight: 120,
                      boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)",
                      marginBottom: 14,
                    }}>
                      {/* --- Hotel info --- */}                      
                      <div 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          fontSize: 24, 
                          fontWeight: 800,
                          color: "#001B48"
                        }}
                      >
                        <span>{hotel?.name || "Hotel"}</span>
                        <span style={{ fontSize: 16, color: "#FE7C2C" }}>
                          <img src="/images/reitingstar-orange.png"
                              alt="Star"
                              style={{
                                width: 16,
                                height: 16,
                                marginRight: 4,
                                verticalAlign: "middle",
                                objectFit: "contain"
                              }}
                            />
                          {fmt1(apt?.rating?.generalRating)}
                        </span>
                      </div>

                      <span style={{ fontWeight: 200, fontSize: 13, color: "#001B48" }}>
                        {getEstablishmentTypeName(hotel?.type)}
                      </span>{" "}
                      <div style={{ color: "#22614D" }}>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.geolocation?.address || "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 13,
                              color: "#02457A",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <img src="/images/geoikon.png" alt="Geo-ikon"
                              style={{ width: 16, height: 16, marginRight: 6, objectFit: "contain" }} />
                        
                          <span className="fw-bold" style={{ fontSize: 14, color: "#22614D" }}>                        
                              {hotel.geolocation?.address
                                ?.split(",")
                                ?.filter((_, i) => [0, 1, 3, 6].includes(i))
                                ?.join(", ")}
                            </span>
                        </a>
                      </div>                      

                      <div className="mt-2" style={{ fontSize: 14, color: "#001B48" }}>
                        Great location - {fmt1(apt?.rating?.generalRating)}
                      </div>

                      <div className="mt-2" style={{ fontSize: 14 }}>
                        <span style={{ fontSize: 16, color: "#FE7C2C" }}>
                          <img src="/images/reitingstar-orange.png"
                              alt="Star"
                              style={{
                                width: 16,
                                height: 16,
                                marginRight: 4,
                                verticalAlign: "middle",
                                objectFit: "contain"
                              }}
                            />
                          {fmt1(apt?.rating?.generalRating)}
                        </span>
                        <span style={{marginLeft: 6, marginRight: 6, color: "#001B48"}}>
                          Rating excellent /                            
                        </span>
                        <span style={{ color: "#737373" }}>
                          {hotel?.rating?.reviewCount != null
                            ? Number(hotel.rating.reviewCount)
                            : "-"}
                        </span>
                      </div>
                      {/* Вивід зручностей готеля з іконками */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: 20, marginBlockEnd: 20 }}>
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
                            <div key={index} style={{ display: "flex", alignItems: "center", fontSize: 12, color: "#001B48" }}>
                              <img
                                src={`/images/features/${featureName}.png`}
                                alt={featureName}
                                style={{ width: 20, height: 20, marginRight: 6 }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              {featureName.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                          ));
                        })()}
                      </div>                      
                      <div className="mt-2 text-muted" style={{ fontSize: 13}}>Your apartment: {apt?.name}</div>
                      {/* Вивід зручностей апартамента з іконками */}
                      {apt?.features && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "6px 0 8px" }}>
                          {(() => {
                            let names = [];
                            if (typeof apt.features === "number") {
                              // якщо бек дає бітмаску
                              names = decodeFlagsUser(apt.features, APARTMENT_FEATURE_LABELS);
                            } else if (typeof apt.features === "object") {
                              // якщо бек дає об'єкт булів { freeWifi: true, ... }
                              names = Object.keys(APARTMENT_FEATURE_LABELS).filter(k =>
                                apt.features[k.charAt(0).toLowerCase() + k.slice(1)]
                              );
                            }

                            return names.map((name) => (
                              <div
                                key={name}
                                className="d-inline-flex align-items-center px-2 py-1"
                                style={{ fontSize: 12, color: "#001B48" }}
                              >
                                <img
                                  src={`/images/apartment-features/${name}.png`}
                                  alt={name}
                                  style={{ width: 16, height: 16, marginRight: 6 }}
                                  onError={(e) => {
                                    // fallback: пробуємо /images/features/<name>.png; якщо і його нема — ховаємо іконку
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

                      <hr></hr>
                      {/* --- Booking details --- */}
                      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16, color: "#001B48" }}>Your booking details</div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: 16 }}>
                        {/* Check-in */}
                        <div>
                          <div style={{ color: "#0F3E0F", fontWeight: 800, marginBottom: 8 }}>Check-in</div>
                          <div style={{color: "#001B48"}}>{formatDate(booking.dateFrom)}</div>
                          <div style={{color: "#001B48"}}>Check-in Time: {booking.dateFrom.slice(11, 16)}</div>
                        </div>

                        {/* Check-out */}
                        <div>
                          <div style={{ color: "#0F3E0F", fontWeight: 800, marginBottom: 8 }}>Check-out</div>
                          <div style={{color: "#001B48"}}>{formatDate(booking.dateTo)}</div>
                          <div style={{color: "#001B48"}}>Check-out Time: {booking.dateTo.slice(11, 16)}</div>
                        </div>

                        <div>
                          <div style={{ color: "#0F3E0F", fontWeight: 600, marginBottom: 8 }}>Total length of stay:</div>
                          <div style={{ color: "#0F3E0F", fontWeight: 600, marginBottom: 8 }}>You have selected:</div>
                          
                        </div>

                        <div>
                          <div style={{color: "#001B48"}}>{getNights(booking.dateFrom, booking.dateTo)} {getNights(booking.dateFrom, booking.dateTo) === 1 ? "night" : "nights"}</div>
                          <div style={{color: "#001B48"}}>1 room for {apt?.capacity} adults</div>
                        </div>
                      </div>           

                      {/* --- Payment details --- */}
                      <div style={{color: "#001B48"}}>Status: <span style={{ color: booking.isCheckedIn ? "#29b56f" : "#f9a825", fontWeight: 600 }}>
                        {booking.isCheckedIn ? "Checked in" : "Awaiting check-in"}
                      </span></div>
                      <hr></hr>
                      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: "#001B48" }}>Your payment details</div>
                      <div>
                        <span style={{color: "#001B48"}}>Total price:</span>{" "}
                        <b style={{color: "#0F3E0F"}}>
                          {getTotalPrice(booking)} {booking.currency || "EUR"}
                        </b>
                      </div>
                      <div style={{color: "#001B48"}}>
                        Status:{" "}
                        <span style={{ color: "#29b56f", fontWeight: 600 }}>
                          {booking.isPaid ? "Paid" : "Not paid"}
                        </span>
                      </div>
                      <hr></hr>

                      <div
                        className="d-flex justify-content-center align-items-center gap-2 flex-wrap"
                        style={{ marginBottom: 16 }}
                      >
                        <button
                          className="btn btn-outline-primary btn-sm"
                          style={{ borderRadius: 10, minWidth: "30%", fontWeight: 600 }}
                          onClick={() => openEditModal(booking)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-outline-danger btn-sm"
                          style={{ borderRadius: 10, minWidth: "30%", fontWeight: 600 }}
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel booking
                        </button>

                        {canAddReview && (
                          <button
                            className="btn btn-success btn-sm"
                            style={{ borderRadius: 10, minWidth: "30%", fontWeight: 600 }}
                            onClick={() => setAddReviewModal({ show: true, booking })}
                          >
                            Add Review
                          </button>
                        )}
                      </div>
                   
                    </div>                 
                    

                    {/* --- HR between bookings --- */}
                    {idx < upcoming.length - 1 && <hr style={{ margin: "20px 0", borderTop: "2px solid #dde2e7" }} />}
                  </div>                  
                )                
              })
            )}

            {/* Історія бронювань */}
            <div style={{background: "#fcfcfc", borderRadius: 18, padding: 24, minHeight: 120, boxShadow: "1px 1px 3px 3px rgba(20, 155, 245, 0.2)" }}>
              <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 10, marginTop: 30, color: "#001B48" }}>
                Booking history
              </div>
              <hr></hr>
              {history.length === 0 && (
                <div style={{ color: "#aaa" }}>No past bookings found.</div>
              )}
              {history.map((b, idx) => (
                <div key={b.id} className="mb-2" style={{ borderBottom: "1px solid #eee", paddingBottom: 10 }}>
                  <div style={{ fontWeight: 600, color: "#001B48", fontSize: 20 }}>{b.apartment?.establishment?.name || "Hotel"}</div>
                  <div style={{ fontWeight: 300, color: "#001B48", fontSize: 14 }}>{b.apartment?.name}</div>
                  <div style={{ fontWeight: 500, color: "#001B48", fontSize: 16 }}>
                    {new Date(b.dateFrom).toLocaleDateString()} &ndash; {new Date(b.dateTo).toLocaleDateString()}
                  </div>
                  {/* Потім переробити на отримання статусу з бека */}
                  <div style={{ fontWeight: 300, color: "#001B48", fontSize: 16 }}>Status: <span style={{ color: "#aaa" }}>Completed</span></div>
                  <button
                    className="btn btn-success btn-sm mt-2"
                    style={{ borderRadius: 10, minWidth: 110, fontWeight: 600 }}
                    onClick={() => setAddReviewModal({ show: true, booking: b })}
                  >
                    Add Review
                  </button>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* модалка редагування бронювання (додати перевірку дат бронювання!!!!!!!!!!) */}
        {editModal.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.38)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={closeEditModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 32,
              minWidth: 320,
              boxShadow: "0 8px 36px 0 rgba(31, 38, 135, 0.19)",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3>Edit Booking Dates</h3>
            <label style={{ marginTop: 16 }}>Check-in date:</label>
            <input
              type="date"
              value={editModal.dateFrom}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setEditModal(em => ({ ...em, dateFrom: e.target.value }))}
              className="form-control mb-2"
            />
            <label>Check-out date:</label>
            <input
              type="date"
              value={editModal.dateTo}
              min={editModal.dateFrom || new Date().toISOString().slice(0, 10)}
              onChange={e => setEditModal(em => ({ ...em, dateTo: e.target.value }))}
              className="form-control mb-3"
            />
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary" onClick={handleEditBooking}>
                Save
              </button>
              <button className="btn btn-secondary" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      {/* модалка додавання відгуків */}
      {addReviewModal.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.38)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setAddReviewModal({ show: false, booking: null })}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.88)",
              borderRadius: 18,
              padding: 32,
              minWidth: 420,
              boxShadow: "0 8px 36px 0 rgba(31, 38, 135, 0.19)",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <AddComment
              bookingId={addReviewModal.booking?.id}
              apartmentId={addReviewModal.booking?.apartmentId || addReviewModal.booking?.apartment?.id}
              onClose={() => setAddReviewModal({ show: false, booking: null })}
            />
            <button
              className="btn btn-secondary btn-sm mt-3"
              style={{ borderRadius: 10, minWidth: 100 }}
              onClick={() => setAddReviewModal({ show: false, booking: null })}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Модалка зміни пароля */}
      {pwModal.show && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.38)",
          zIndex: 2100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onClick={() => setPwModal({ show: false, current: "", next: "", confirm: "", loading: false, error: "" })}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 28,
            minWidth: 360,
            boxShadow: "0 8px 36px rgba(31,38,135,.19)"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h5 className="mb-3">Change password</h5>

          <label className="form-label">Current password</label>
          <input
            type="password"
            className="form-control mb-2"
            value={pwModal.current}
            onChange={(e) => setPwModal(m => ({ ...m, current: e.target.value }))}
            placeholder="Current password"
          />

          <label className="form-label mt-2">New password</label>
          <input
            type="password"
            className="form-control mb-2"
            value={pwModal.next}
            onChange={(e) => setPwModal(m => ({ ...m, next: e.target.value }))}
            placeholder="New password (min 6 chars)"
          />

          <label className="form-label mt-2">Confirm new password</label>
          <input
            type="password"
            className="form-control"
            value={pwModal.confirm}
            onChange={(e) => setPwModal(m => ({ ...m, confirm: e.target.value }))}
            placeholder="Repeat new password"
          />

          {pwModal.error && (
            <div className="text-danger mt-2" style={{ fontSize: 13 }}>
              {pwModal.error}
            </div>
          )}

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-primary"
              onClick={handleChangePassword}
              disabled={pwModal.loading}
            >
              {pwModal.loading ? "Saving..." : "Change"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setPwModal({ show: false, current: "", next: "", confirm: "", loading: false, error: "" })}
              disabled={pwModal.loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}


      
    </div>
    
  );
};






// --- ПРОГРЕС-БАР (3 кроки)
function ProgressBar({ activeStep }) {
  // 1: Your choice, 2: Your details, 3: Completing your booking
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "2px solid #d5e3f7",
      paddingBottom: 8,
      marginBottom: 14
    }}>
      {["Your choice", "Your details", "Completing your booking"].map((step, i) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          color: i < activeStep ? "#24ac70" : "#555",
          fontWeight: i === activeStep - 1 ? 700 : 500,
          fontSize: 17,
        }}>
          <span style={{
            display: "inline-block",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: i < activeStep ? "#24ac70" : "#e9e9e9",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "22px",
            textAlign: "center",
            marginRight: 8,
            border: i === activeStep - 1 ? "2px solid #2ca377" : "2px solid #e9e9e9"
          }}>{i + 1}</span>
          {step}
          {i !== 2 && <span style={{
            display: "inline-block",
            width: 70,
            height: 3,
            background: i < activeStep - 1 ? "#24ac70" : "#e9e9e9",
            margin: "0 16px",
            borderRadius: 2
          }} />}
        </div>
      ))}
    </div>
  );
}

export default UserPanel;
