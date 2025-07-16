import { useState } from "react";

const criteria = ["Location", "Amenities", "Services", "Price", "Rooms"];

const AddComment = () => {
  const [ratings, setRatings] = useState({
    Location: 0,
    Amenities: 0,
    Services: 0,
    Price: 0,
    Rooms: 0
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    comment: "",
    save: false
  });

  const handleRating = (crit, val) => setRatings(r => ({ ...r, [crit]: val }));

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    alert("Thanks for your comment!");
  };

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
                <div key={crit} style={{ minWidth: 80 }}>
                  <div style={{ fontSize: 10 }}>{crit}</div>
                  {[1, 2, 3, 4, 5].map(val => (
                    <span
                      key={val}
                      onClick={() => handleRating(crit, val)}
                      style={{
                        color: ratings[crit] >= val ? "#F7B801" : "#ccc",
                        cursor: "pointer",
                        fontSize: 18,
                        transition: "color .12s"
                      }}
                    >★</span>
                  ))}
                </div>
              ))}
            </div>
            <div className="row mb-3">
              <div className="col">
                <input
                  className="form-control mb-2"
                  style={{fontSize: 12}}
                  placeholder="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col">
                <input
                  className="form-control mb-2"
                  style={{fontSize: 12}}
                  placeholder="Email address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  required
                />
              </div>
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
            <div className="mb-3 form-check" style={{ marginBottom: 22 }}>
              <input
                className="form-check-input"
                type="checkbox"
                id="save"
                name="save"
                checked={form.save}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="save" style={{ fontSize: 9 }}>
                Save my name, email in this browser for the next time.
              </label>
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
