import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { createEstablishment } from "../../api/establishmentsApi";

const AddHotel = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user); 
  const [hotel, setHotel] = useState({
    name: "",
    address: "",
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
      const payload = { ...hotel, ownerId: user.id, photos: [] };
      await createEstablishment(payload);
      navigate("/landlordpanel");
    } catch (err) {
      console.error("❌ Error adding hotel:", err);
    }

  };

  return (
    <div className="container mt-4">
      <h3>➕ Add a new hotel</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name of the hotel"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />
        <input
          name="address"
          placeholder="City, address"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Brief description"
          className="form-control mb-3"
          onChange={handleChange}
          required
        /> 
         {/* <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          className="form-control mb-3"
          onChange={handleFileChange}
        /> */}

        <button className="btn btn-primary">Add a hotel</button>
      </form>
    </div>
  );
};

export default AddHotel;
