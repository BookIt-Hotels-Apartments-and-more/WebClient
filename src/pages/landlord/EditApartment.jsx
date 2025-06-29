import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApartmentById, updateApartment } from "../../api/apartmentApi";

const EditApartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [apartment, setApartment] = useState({
      name: "",
      price: 0,
      capacity: 1,
      description: "",
      establishmentId: 0,
    });


  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const data = await getApartmentById(id);
        setApartment({
          name: data.name || "",
          price: data.price || 0,
          capacity: data.capacity || 1,
          description: data.description || "",
          establishmentId: data.establishment?.id || 0,
        });

      } catch (error) {
        console.error("❌ Error loading apartment:", error);
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
      navigate("/landlordpanel"); 
    } catch (error) {
      console.error("❌ Error updating apartment:", error);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h3>✏️ Edit apartment</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name apartment</label>
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
          <label className="form-label">Price</label>
          <input
            type="number"
            name="price"
            className="form-control"
            value={apartment.price}
            onChange={handleChange}
            required
          />
        </div>
        <button className="btn btn-success">Save</button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </form>
    </div>
  );
};

export default EditApartment;
