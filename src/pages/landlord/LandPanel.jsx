import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getEstablishmentsByOwner } from "../../api/establishmentsApi";
import LandEstablishmentCard from "./LandEstablishmentCard";
import { getAllEstablishments } from "../../api/establishmentsApi";
import { fetchApartments } from "../../api/apartmentApi";
import { Link } from "react-router-dom";

const LandPanel = () => {
  const user = useSelector((state) => state.user.user);
  const [establishments, setEstablishments] = useState([]);
  const [showHotels, setShowHotels] = useState(false);

  const [totalApartments, setTotalApartments] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("📤 New data saved:", editedUser);
    // TODO: відправити PATCH на бекенд
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({
      username: user?.username || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

    useEffect(() => {
      if (user?.id) {
        Promise.all([getAllEstablishments(), fetchApartments()])
          .then(([estData, aptData]) => {
            const myEstablishments = estData.filter(e => e.owner && e.owner.email === user.email);
            const myEstIds = myEstablishments.map(e => e.id);
            const myApartments = aptData.filter(a => myEstIds.includes(a.establishment.id));

            setEstablishments(myEstablishments);
            setTotalApartments(myApartments.length);
            // Аналогічно рахуємо totalBookings, якщо потрібно
          })
          .catch(console.error);
      }
    }, [user]);

    const reloadStats = () => {
      if (user?.id) {
        Promise.all([getAllEstablishments(), fetchApartments()])
          .then(([estData, aptData]) => {
            const myEstablishments = estData.filter(e => e.owner && e.owner.email === user.email);
            const myEstIds = myEstablishments.map(e => e.id);
            const myApartments = aptData.filter(a => myEstIds.includes(a.establishment.id));

            setEstablishments(myEstablishments);
            setTotalApartments(myApartments.length);
            // тут якщо треба totalBookings - так само, фільтруй по апартаментам
          })
          .catch(console.error);
      }
    };


      useEffect(reloadStats, [user]);

  


  return (
    <div className="container mt-4">
      <h2 className="mb-4">👤 Landlord Panel</h2>

      {/* Особиста інформація */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Personal information</h5>

          {isEditing ? (
            <>
              <div className="mb-2">
                <label>Name</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={editedUser.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={editedUser.email}
                  onChange={handleInputChange}
                />
              </div>
              <button className="btn btn-sm btn-outline-success me-2" onClick={handleSave}>
                Save
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <p><strong>Name:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(true)}>
                ✏️ Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Загальна статистика */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">📊 General statistics</h5>
          <p><strong>Hotels:</strong> {establishments.length}</p>
          <p><strong>Apartment:</strong> {totalApartments}</p>
          <p><strong>Reservations:</strong> {totalBookings}</p>
        </div>
      </div>

      {/* Кнопки дій */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <button className="btn btn-outline-primary" onClick={() => setShowHotels(!showHotels)}>
          {showHotels ? "❌ Hide hotels" : "🏨 View my hotels"}
        </button>
        <Link to="/add-hotel" className="btn btn-success">
          ➕ Add a new hotel
        </Link>
      </div>

            {/* Готелі */}
      {showHotels && (
        <div>
          {establishments.length === 0 ? (
            <p className="text-muted">You don't have any hotels yet.</p>
          ) : (
            establishments.map((est) => (
              <LandEstablishmentCard key={est.id} est={est} reloadStats={reloadStats} />
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default LandPanel;
