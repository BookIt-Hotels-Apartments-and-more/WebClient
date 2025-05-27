import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";
import { getUserBookings } from "../../api/bookingApi";
import { getUserFavorites } from "../../api/favoriteApi";
import { getApartmentById } from "../../api/apartmentApi";


const UserPanel = ({ user, onClose }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [apartmentMap, setApartmentMap] = useState({});
  const [loading, setLoading] = useState(true);


useEffect(() => {
  setLoading(true);
  if (!user?.id) return;

  const fetchData = async () => {
    try {
      const [bookData, favData] = await Promise.all([
        getUserBookings(user.id),
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
      console.error("Помилка завантаження:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [user]);


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
    console.log("🟢 Надіслано на збереження:", editedUser);
    // TODO: Надіслати PATCH-запит на бекенд
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
      console.error("Помилка завантаження апартаменту:", err);
    }
  }
  setApartmentMap(newMap);
};



  return (
    <div
      className="position-fixed top-0 end-0 bg-white h-100 shadow p-4"
      style={{ width: "30vw", zIndex: 1050 }}
    >
      <button
        type="button"
        className="btn-close position-absolute top-0 end-0 m-3"
        aria-label="Закрити"
        onClick={onClose}
      ></button>

      <h4 className="mb-3">{t.userpanel}</h4>

      {isEditing ? (
        <>
          <div className="mb-3">
            <label className="form-label">{t.fullName}</label>
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
            <label className="form-label">{t.email}</label>
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
            {t.save}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={handleCancel}>
            {t.cancel}
          </button>
        </>
      ) : (
        <>
          <p>
            <strong>{t.fullName}:</strong> {user?.username}
          </p>
          <p>
            <strong>{t.email}:</strong> {user?.email}
          </p>
          <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => setIsEditing(true)}>
            {t.edit}
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
      <h5>{t.bookinghistory}</h5>
          {bookings.length === 0 ? (
            <p className="text-muted">Бронювань не знайдено</p>
          ) : (
            <ul className="list-group mb-3">
              {bookings.map((b) => {
                const apt = apartmentMap[b.apartmentId];
                return (
                  <li key={b.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <Link to={`/hotels/${apt?.establishmentId || ""}`}>
                        🏨 {apt?.name || `Апартамент ${b.apartmentId}`}
                      </Link>
                      <div className="text-muted small">{b.dateFrom} → {b.dateTo}</div>
                    </div>
                    <button className="btn btn-sm btn-outline-danger">Скасувати</button>
                  </li>
                );
              })}
            </ul>
          )}


        <h5>{t.favoriteuser}</h5>
            {favorites.length === 0 ? (
              <p className="text-muted">Немає обраного</p>
            ) : (
              <ul className="list-group">
                {favorites.map((f) => {
                  const apt = apartmentMap[f.apartmentId];
                  return (
                    <li key={f.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <Link to={`/hotels/${apt?.establishmentId || ""}`}>
                        🏨 {apt?.name || `Апартамент ${f.apartmentId}`}
                      </Link>
                      <button className="btn btn-sm btn-outline-danger">Видалити</button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}


      

    </div>
  );

};

export default UserPanel;
