import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getEstablishmentsByOwner } from "../../api/establishmentsApi";
import LandEstablishmentCard from "./LandEstablishmentCard";
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
    console.log("📤 Збережено нові дані:", editedUser);
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

  // useEffect(() => {
  //   if (user?.id) {
  //     getEstablishmentsByOwner(user.id)
  //       .then((data) => {
  //         setEstablishments(data);

  //         // Загальна статистика
  //         let allApts = 0;
  //         let allBookings = 0;
  //         data.forEach((e) => {
  //           allApts += e.apartmentCount || 0;
  //           allBookings += e.bookingCount || 0;
  //         });
  //         setTotalApartments(allApts);
  //         setTotalBookings(allBookings);
  //       })
  //       .catch(console.error);
  //   }
  // }, [user]);

  useEffect(() => {
  // Тестові готелі (мок-дані)
  const mockHotels = [
    {
      id: 1,
      name: "Elysium Resort & Spa",
      location: "Львів, просп. Свободи 5",
      description: "Розкішний готель з видом на центр Львова",
      apartmentCount: 4,
      bookingCount: 12,
    },
    {
      id: 2,
      name: "Mountain Chalet",
      location: "Карпати, Яремче",
      description: "Гірський курорт із сауною та джакузі",
      apartmentCount: 7,
      bookingCount: 25,
    },
  ];

  setEstablishments(mockHotels);

  // Обчислюємо загальну статистику
  const totalApts = mockHotels.reduce((sum, e) => sum + (e.apartmentCount || 0), 0);
  const totalBooks = mockHotels.reduce((sum, e) => sum + (e.bookingCount || 0), 0);

  setTotalApartments(totalApts);
  setTotalBookings(totalBooks);
}, []);


  return (
    <div className="container mt-4">
      <h2 className="mb-4">👤 Панель орендодавця</h2>

      {/* Особиста інформація */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Особиста інформація</h5>

          {isEditing ? (
            <>
              <div className="mb-2">
                <label>Ім’я</label>
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
                Зберегти
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={handleCancel}>
                Скасувати
              </button>
            </>
          ) : (
            <>
              <p><strong>Ім’я:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(true)}>
                ✏️ Редагувати
              </button>
            </>
          )}
        </div>
      </div>

      {/* Загальна статистика */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">📊 Загальна статистика</h5>
          <p><strong>Готелів:</strong> {establishments.length}</p>
          <p><strong>Номерів:</strong> {totalApartments}</p>
          <p><strong>Бронювань:</strong> {totalBookings}</p>
        </div>
      </div>

      {/* Кнопки дій */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <button className="btn btn-outline-primary" onClick={() => setShowHotels(!showHotels)}>
          {showHotels ? "❌ Приховати готелі" : "🏨 Переглянути мої готелі"}
        </button>
        <Link to="/add-hotel" className="btn btn-success">
          ➕ Додати новий готель
        </Link>
      </div>

      {/* Готелі */}
      {showHotels && (
        <div>
          {establishments.length === 0 ? (
            <p className="text-muted">У вас ще немає готелів.</p>
          ) : (
            establishments.map((est) => (
              <LandEstablishmentCard key={est.id} est={est} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LandPanel;
