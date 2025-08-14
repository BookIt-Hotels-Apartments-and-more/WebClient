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

const MAX = 10;
const PER_ROW = 5;

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

  const renderTenStars = (critKey, label) => {
    return (
      <div style={{ minWidth: 160 }}>
        <div style={{ fontSize: 12, marginBottom: 4, color: "#4a5568" }}>
          {label}
          <span style={{ marginLeft: 8, fontSize: 11, color: "#718096" }}>
            {ratings[critKey]}/10
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${PER_ROW}, 22px)`,
            gridAutoRows: "22px",
            gap: 4,
            alignItems: "center",
          }}
        >
          {Array.from({ length: MAX }, (_, i) => i + 1).map((val) => {
            const active = ratings[critKey] >= val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleRating(critKey, val)}
                aria-label={`${label} ${val}/10`}
                title={`${label}: ${val}/10`}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  lineHeight: "22px",
                  textAlign: "center",
                  userSelect: "none",
                }}
              >
                <span
                  style={{
                    color: active ? "#F7B801" : "#CBD5E0",
                    fontSize: 18,
                    transition: "color .12s",
                    display: "inline-block",
                    width: 18,
                  }}
                >
                  ★
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };


  return (
    <section
      role="dialog"
      aria-modal="true"
      className="my-5"
      style={{
        width: "min(80vw, 1000px)",
        maxHeight: "60vh",
        overflowY: "auto",
        margin: "0 auto",
        padding: 16,
        borderRadius: 16,
        boxShadow: "0 12px 40px rgba(0,0,0,.12)",
        background: "rgba(255, 255, 255, 0.58)",   // ← напівпрозорий білий фон
        backdropFilter: "blur(1px)",                // легкий блюр для краси
        WebkitBackdropFilter: "blur(1px)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            width: "min(420px, 80%)",
          }}
        >
          <img
            src="/images/feedback.png"
            alt="Feedback"
            style={{ width: "100%", objectFit: "contain", display: "block" }}
          />
        </div>

        <div
          className="p-4"
          style={{
            background: "transparent",
            borderRadius: 16,
            width: "100%",
            maxWidth: 820,
          }}
        >
          <h4 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            Add a Comment
          </h4>
          <div className="mb-2" style={{ color: "#6A778B", fontSize: 10 }}>
            Your email address will not be published. Required fields are marked.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3" style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {criteria.map((crit) => (
                <div key={crit.key}>{renderTenStars(crit.key, crit.label)}</div>
              ))}
            </div>

            <textarea
              className="form-control mb-3"
              style={{ fontSize: 12 }}
              placeholder="Comment"
              rows={2}
              name="comment"
              value={form.comment}
              onChange={handleChange}
              required
            />

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
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                {newPhotos.map((p, idx) => (
                  <img
                    key={idx}
                    src={p.base64}
                    alt={`preview-${idx}`}
                    style={{
                      width: 70,
                      height: 70,
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                    }}
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
                  fontSize: 10,
                }}
              >
                Send a comment
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );

};

export default AddComment;
