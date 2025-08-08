import { useState } from "react";
import { createReview } from "../api/reviewApi";
import { toast } from 'react-toastify';

const criteria = [
  { key: "Staff", label: "Staff" },
  { key: "Purity", label: "Purity" },
  { key: "PriceQuality", label: "Price/Quality" },
  { key: "Comfort", label: "Comfort" },
  { key: "Facilities", label: "Facilities" },
  { key: "Location", label: "Location" },
  { key: "CustomerStay", label: "Overall stay" }
];

const AddComment = (props) => {
  if (!props.bookingId || !props.apartmentId) {
    return <div>Invalid review context. Try to reload the page.</div>;
  }

  const [ratings, setRatings] = useState({
    Staff: 0,
    Purity: 0,
    PriceQuality: 0,
    Comfort: 0,
    Facilities: 0,
    Location: 0,
    CustomerStay: 0
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    comment: "",
    save: false
  });
  const [newPhotos, setNewPhotos] = useState([]);

  const handleRating = (crit, val) => setRatings(r => ({ ...r, [crit]: val }));

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const review = {
      text: form.comment,
      staffRating: ratings.Staff,
      purityRating: ratings.Purity,
      priceQualityRating: ratings.PriceQuality,
      comfortRating: ratings.Comfort,
      facilitiesRating: ratings.Facilities,
      locationRating: ratings.Location,
      customerStayRating: ratings.CustomerStay,
      bookingId: props.bookingId,
      customerId: props.customerId,
      apartmentId: props.apartmentId,
      existingPhotosIds: [],
      newPhotosBase64: newPhotos.map(p => p.base64)
    };
    try {
      await createReview(review);
      toast.success("Thank you for your review!", { autoClose: 4000 });
      props.onClose && props.onClose();
    } catch (err) {
      toast.success("Failed to submit review", { autoClose: 4000 });
    }
  };

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    const updated = [];
    for (const file of files) {
      const base64 = await toBase64(file);
      updated.push({ file, base64 });
    }
    setNewPhotos(updated);
  };

  const toBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });


  return (
    <section
      className="my-5"
      style={{
        maxWidth: 900,
        margin: "0 auto",
        background: "transparent",
        padding: 0,
        marginBottom: "-200px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center", 
          justifyContent: "space-between",
          gap: 36,
          minHeight: 400,
          background: "transparent",
        }}
      >
        {/* --- Ліва частина: Форма --- */}
        <div
          className="p-4"
          style={{
            background: "transparent",
            borderRadius: 16,
            width: 550,        
            minWidth: 340,
            marginBottom: 0,
            position: "relative",
            zIndex: 2,
          }}
        >
          <h4 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Add a Comment</h4>
          <div className="mb-2" style={{ color: "#6A778B", fontSize: 10 }}>
            Your email address will not be published. Required fields are marked.
          </div>
          <form onSubmit={handleSubmit}>
            <div className="d-flex mb-3" style={{ gap: 12, flexWrap: "wrap" }}>
              {criteria.map(crit => (
                <div key={crit.key} style={{ minWidth: 80 }}>
                  <div style={{ fontSize: 10 }}>{crit.label}</div>
                  {[1, 2, 3, 4, 5].map(val => (
                    <span
                      key={val}
                      onClick={() => handleRating(crit.key, val)}
                      style={{
                        color: ratings[crit.key] >= val ? "#F7B801" : "#ccc",
                        cursor: "pointer",
                        fontSize: 18,
                        transition: "color .12s"
                      }}
                    >★</span>
                  ))}
                </div>
              ))}
            </div>            
            <textarea
              className="form-control mb-3"
              style={{fontSize: 12}}
              placeholder="Comment"
              rows={2}
              name="comment"
              value={form.comment}
              onChange={handleChange}
              required
            />

            {/* --- Фото upload --- */}
            <div className="mb-3">
              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Add photo(s) to your review (optional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="form-control"
                style={{ fontSize: 11 }}
                onChange={handlePhotoChange}
              />
              {/* Preview selected images */}
              <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                {newPhotos.map((p, idx) => (
                  <img
                    key={idx}
                    src={p.base64}
                    alt={`preview-${idx}`}
                    style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 10, border: "1px solid #ddd" }}
                  />
                ))}
              </div>
            </div>


            <div className="mb-3 form-check" style={{ marginBottom: 22 }}>
             
              <button
              type="submit"
              className="btn"
              style={{
                background: "#3CA19A",
                color: "#fff",
                borderRadius: 10,
                padding: "5px 15px",
                fontWeight: 300,
                float: "right",
                marginTop: 6,
                boxShadow: "0 2px 6px rgba(60,161,154,0.08)",
                fontSize: 10
              }}
            >
              Send a comment
            </button>
            </div>
            
          </form>
        </div>
        {/* --- Права частина: Картинка --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center", 
            minHeight: 360,
            height: "100%",
            flex: 1,
            justifyContent: "flex-end",
            zIndex: 1,
          }}
        >
          <img
            src="/images/feedback.png"
            alt="Feedback"
            style={{
              width: "100%",
              minWidth: 360,
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default AddComment;
