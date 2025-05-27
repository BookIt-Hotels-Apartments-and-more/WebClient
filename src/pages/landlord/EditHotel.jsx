import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEstablishmentById, updateEstablishment } from "../../api/establishmentsApi";

const EditHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState({ name: "", location: "", description: "" });

  useEffect(() => {
    getEstablishmentById(id).then(setHotel).catch(console.error);
  }, [id]);

  const handleChange = (e) => {
    setHotel({ ...hotel, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateEstablishment(id, hotel);
      navigate("/landlordpanel");
    } catch (err) {
      console.error("❌ Помилка оновлення", err);
    }
  };

  return (
    <div className="container mt-4">
      <h3>✏️ Редагувати готель</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" value={hotel.name} onChange={handleChange} className="form-control mb-2" />
        <input name="location" value={hotel.location} onChange={handleChange} className="form-control mb-2" />
        <textarea name="description" value={hotel.description} onChange={handleChange} className="form-control mb-3" />
        <button className="btn btn-success">Зберегти</button>
      </form>
    </div>
  );
};

export default EditHotel;
