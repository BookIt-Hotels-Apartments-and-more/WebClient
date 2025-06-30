import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getEstablishmentById, updateEstablishment } from "../../api/establishmentsApi";

const EditHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [hotel, setHotel] = useState({
  name: "",
  address: "",
  description: "",
  ownerId: user?.id || null,
  createdAt: "",
  photos: [],
  rating: null,
});

  useEffect(() => {
  getEstablishmentById(id).then((data) => {
    setHotel({
      name: data.name || "",
      address: data.address || "",
      description: data.description || "",
      ownerId: data.ownerId || user?.id,
      createdAt: data.createdAt,
      photos: data.photos || [],
      rating: data.rating || null,
    });
  }).catch(console.error);
}, [id]);

  const handleChange = (e) => {
    setHotel((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting hotel:", hotel);
      await updateEstablishment(id, getRequestBody(hotel));
      navigate("/landlordpanel");
    } catch (err) {
      console.error("❌ Update failed", err);
    }
  };

  const getRequestBody = (hotel) => ({
  name: hotel.name,
  address: hotel.address,
  description: hotel.description,
  ownerId: hotel.ownerId || user?.id,
  rating: hotel.rating,
  photos: hotel.photos,
});


  return (
    <div className="container mt-4">
      <h3>✏️ Edit hotel</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" value={hotel.name} onChange={handleChange} className="form-control mb-2" />
        <input name="address" value={hotel.address} onChange={handleChange} className="form-control mb-2" />
        <textarea name="description" value={hotel.description} onChange={handleChange} className="form-control mb-3" />

        <button className="btn btn-success">Save</button>

        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditHotel;
