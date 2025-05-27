import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { createEstablishment } from "../../api/establishmentsApi";

const AddHotel = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user); // отримуємо користувача з Redux
  const [hotel, setHotel] = useState({
    name: "",
    location: "",
    description: ""
  });

  const handleChange = (e) => {
    setHotel({ ...hotel, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert("Користувач не авторизований");
      return;
    }

    try {
      const payload = { ...hotel, ownerId: user.id };
      await createEstablishment(payload);
      navigate("/landlordpanel");
    } catch (err) {
      console.error("❌ Помилка додавання готелю:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h3>➕ Додати новий готель</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Назва готелю"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />
        <input
          name="location"
          placeholder="Місто, адреса"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Короткий опис"
          className="form-control mb-3"
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary">Додати готель</button>
      </form>
    </div>
  );
};

export default AddHotel;
