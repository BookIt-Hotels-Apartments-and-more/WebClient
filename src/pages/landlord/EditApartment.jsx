import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApartmentById, updateApartment } from "../../api/apartmentApi";

const EditApartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [apartment, setApartment] = useState({
    name: "",
    price: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const data = await getApartmentById(id);
        setApartment({
          name: data.name || "",
          price: data.price || 0,
        });
      } catch (error) {
        console.error("❌ Помилка при завантаженні апартаменту:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApartment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApartment((prev) => ({
      ...prev,
      [name]: name === "price" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateApartment(id, apartment);
      navigate("/landlordpanel"); // повернення на панель
    } catch (error) {
      console.error("❌ Помилка при оновленні апартаменту:", error);
    }
  };

  if (loading) return <div className="container mt-4">Завантаження...</div>;

  return (
    <div className="container mt-4">
      <h3>✏️ Редагувати номер</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Назва номеру</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={apartment.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Ціна</label>
          <input
            type="number"
            name="price"
            className="form-control"
            value={apartment.price}
            onChange={handleChange}
            required
          />
        </div>
        <button className="btn btn-success">Зберегти</button>
      </form>
    </div>
  );
};

export default EditApartment;
