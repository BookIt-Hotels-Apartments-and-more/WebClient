import React, { useEffect, useState } from "react";
import { getAllBookings  } from "../../api/bookingApi";
import { getUserFavorites, removeFavorite } from "../../api/favoriteApi";
import { getApartmentById } from "../../api/apartmentApi";
import { Link } from "react-router-dom";

const UserPanel = ({ user, onClose }) => {
  // if (!user || user.role !== 2) return null;
  if (!user) return null;

  //const user = JSON.parse(localStorage.getItem("user"));
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const today = new Date().toISOString().split("T")[0];


  
  useEffect(() => {
    setLoading(true);
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const [bookData, favData] = await Promise.all([
          getAllBookings(),
          getUserFavorites(user.id)
        ]);
        setBookings(bookData);
        setFavorites(favData);

        const ids = [...new Set([
          ...bookData.map(b => b.apartmentId),
          ...favData.map(f => f.apartmentId)
        ])].filter(Boolean);

        await loadApartments(ids);
      } catch (err) {
        console.error("Loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("🟢 Saved to backend:", editedUser);
    // TODO: Send PATCH request to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({
      username: user?.username || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const loadApartments = async (ids) => {
    const newMap = {};
    for (let id of ids) {
      try {
        const apt = await getApartmentById(id);
        newMap[id] = apt;
      } catch (err) {
        console.error("Apartment loading error:", err);
      }
    }
    setApartmentMap(newMap);
  };

  const handleDeleteFavorite = async (favoriteId) => {
  await removeFavorite(favoriteId);
  setFavorites(favorites.filter(f => f.id !== favoriteId));
};

  const myBookings = bookings.filter(
    (b) => b.customer?.email && user && b.customer.email === user.email
  );

  const upcoming = myBookings.filter(b => new Date(b.dateFrom) > new Date());
  const history = myBookings.filter(b => new Date(b.dateTo) < new Date());
 
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };


  return (

    <div
      className="position-fixed top-0 end-0 bg-white h-100 shadow p-4"
      style={{ width: "30vw", zIndex: 1050 }}
    >
      <button
        type="button"
        className="btn-close position-absolute top-0 end-0 m-3"
        aria-label="Close"
        onClick={onClose}
      ></button>

      <h4 className="mb-3">Personal Account</h4>

      {isEditing ? (
        <>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="username"
              placeholder={user?.username}
              value={editedUser.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder={user?.email}
              value={editedUser.email}
              onChange={handleInputChange}
            />
          </div>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <p>
            <strong>Full Name:</strong> {user?.username}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        </>
      )}

      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <>
          <hr />
          <div
            style={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 220px)",
              paddingRight: "8px"
            }}
          >

            {/*  бронювання що очікують */}
            <h5>Upcoming bookings</h5>
                {upcoming.length === 0 ? (
                  <p className="text-muted">No upcoming bookings</p>
                ) : (
                  <ul className="list-group mb-3">
                    {upcoming.map((b) => {
                      const apt = b.apartment;
                      const hotel = apt?.establishment;
                      return (
                        <li key={b.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            {/* Назва готелю — клікабельна */}
                            {hotel?.id ? (
                              <Link to={`/hotels/${hotel.id}`}>
                                🏨 {hotel.name}
                              </Link>
                            ) : (
                              <span className="text-muted">
                                🏨 {hotel?.name || `Hotel ${hotel?.id || "?"}`}
                              </span>
                            )}
                            {/* Назва апартаменту — клікабельна */}
                            {apt?.id ? (
                              <>
                                {" / "}
                                <span className="fw-bold">
                                  {apt.name}
                                </span>
                              </>
                            ) : (
                              ""
                            )}
                            <div className="text-muted small">
                              {formatDate(b.dateFrom)} → {formatDate(b.dateTo)}
                            </div>

                          </div>
                          <button className="btn btn-sm btn-outline-danger">Cancel</button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <h5>Booking history</h5>
                {history.length === 0 ? (
                  <p className="text-muted">No bookings found</p>
                ) : (
                  <ul className="list-group mb-3">
                    {upcoming.map((b) => {
                      const apt = b.apartment;
                      const hotel = apt?.establishment;
                      return (
                        <li key={b.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            {/* Назва готелю — клікабельна */}
                            {hotel?.id ? (
                              <Link to={`/hotels/${hotel.id}`}>
                                🏨 {hotel.name}
                              </Link>
                            ) : (
                              <span className="text-muted">
                                🏨 {hotel?.name || `Hotel ${hotel?.id || "?"}`}
                              </span>
                            )}
                            {/* Назва апартаменту — клікабельна */}
                            {apt?.id ? (
                              <>
                                {" / "}
                                <span className="fw-bold">
                                  {apt.name}
                                </span>
                              </>
                            ) : (
                              ""
                            )}
                            <div className="text-muted small">
                              {formatDate(b.dateFrom)} → {formatDate(b.dateTo)}
                            </div>

                          </div>
                          <button className="btn btn-sm btn-outline-danger">Cancel</button>
                        </li>
                      );
                    })}
                  </ul>
                )}


                      {/* Favorites */}
          <h5>Favorites</h5>
          {favorites.length === 0 ? (
            <p className="text-muted">No favorites found</p>
          ) : (
            <ul className="list-group">
              {favorites.map((f) => {
                const apt = f.apartment;
                const hotel = apt?.establishment;
                return (
                  <li key={f.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {hotel?.id ? (
                      <Link to={`/hotels/${hotel.id}`}>
                        🏨 {hotel.name}
                      </Link>
                    ) : (
                      <span className="text-muted">
                        🏨 {hotel?.name || `Hotel ${hotel?.id || "?"}`}
                      </span>
                    )}
                    {apt?.id ? (
                      <>
                        {" / "}
                        <span className="fw-bold">{apt.name}</span>
                      </>
                    ) : ""}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteFavorite(f.id)}>
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          </div>
                  
        </>
      )}
    </div>
  );
};

export default UserPanel;
