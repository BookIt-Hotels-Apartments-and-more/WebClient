import React from "react";

const BUDGETS = [
  { label: "$0 - $200", min: 0, max: 200, color: "#FFB486" },
  { label: "$200 - $500", min: 200, max: 500, color: "#FF9271" },
  { label: "$500 - $800", min: 500, max: 800, color: "#FF6D5D" },
  { label: "$800 - $1200", min: 800, max: 1200, color: "#FC4D3D" },
  { label: "$1200 - $2000", min: 1200, max: 2000, color: "#FC2D1F" },
  { label: "$2000 - $10000", min: 2000, max: 10000, color: "#F48F4A" },
  { label: "$10000 - $more", min: 10000, max: 999999, color: "#BB6C3D" },
  { label: "SALE", sale: true, color: "#3CB371" }
];

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const FACILITIES = [
  { key: "parking", label: "Parking" },
  { key: "charging", label: "Charging electric vehicles" },
  { key: "restaurant", label: "Restaurant" },
  { key: "beach", label: "Beach", highlight: true },
  { key: "swimmingPool", label: "Swimming pool", highlight: true },
  { key: "airportTransfer", label: "Transfer from/to the airport" },
  { key: "fitness", label: "Fitness center" },
  { key: "foodDelivery", label: "Food delivery to the room", highlight: true },
  { key: "allInclusive", label: "All inclusive" },
  { key: "nonSmoking", label: "Non-smoking rooms" },
];

const ACTIVITIES = [
  { key: "sauna", label: "Sauna", highlight: true },
  { key: "hiking", label: "Hiking" },
  { key: "fishing", label: "Fishing" },
  { key: "beach", label: "Beach", highlight: true },
  { key: "swimmingPool", label: "Swimming pool" },
  { key: "tour", label: "Tour gid" }
];

const SPECIAL = [
  { key: "prepayRefund", label: "Free refund of prepayment", highlight: true },
  { key: "pets", label: "Pets are allowed" },
  { key: "disabled", label: "Conditions for disabled people" },
];

const sectionHeaderStyle = {
  background: "#D6E7EE",
  fontWeight: 700,
  color: "#16396A",
  borderRadius: "16px 16px 0 0",
  fontSize: 21,
  padding: "10px 20px",
  marginBottom: 0,
};

const sectionBoxStyle = {
  background: "#fff",
  borderRadius: "16px",
  marginBottom: 24,
  padding: "0 0 18px 0",
  boxShadow: "0 2px 12px #0002",
};

export default function HotelFilters({
  filters,
  setFilters,
  countryOptions = [],
  showCountry = true
}) {
  const toggleBudget = idx => {
    let arr = Array.isArray(filters.budget) ? [...filters.budget] : [];
    if (arr.includes(idx)) arr = arr.filter(i => i !== idx);
    else arr.push(idx);

    const selected = arr.map(i => BUDGETS[i]).filter(Boolean);
    const minPrice = selected.length ? Math.min(...selected.map(b => b.min ?? 0)) : "";
    const maxPrice = selected.length ? Math.max(...selected.map(b => b.max ?? 0)) : "";
    setFilters(f => ({
      ...f,
      budget: arr,
      minPrice: minPrice,
      maxPrice: maxPrice
    }));
  };

  const setRating = val => setFilters(f => ({ ...f, rating: val === f.rating ? null : val }));

  return (
    <div
      className="hotel-filters"
      style={{
        background: "none",
        borderRadius: 24,
        minWidth: 340,
        maxWidth: 360,
        marginBottom: 32,
        fontFamily: "inherit"
      }}
    >
      {/* Country */}
      {showCountry && (
        <div style={{ ...sectionBoxStyle, marginBottom: 20 }}>
          <div style={{ ...sectionHeaderStyle, borderRadius: "16px", fontSize: 20, marginBottom: 6 }}>
            Country
          </div>
          <div className="mb-2" style={{ margin: "20px" }}>            
            <select
              className="form-select"
              value={filters.country || ""}
              onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}
              style={{
                borderRadius: 12,
                border: "1px solid #DFE5EC",
                fontSize: 15,
                background: "#F9FBFC"
              }}
            >
              <option value="">Any</option>
              {countryOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Budget */}
      <div style={{ marginBottom: 26 }}>
        <div style={sectionHeaderStyle}>
          Your budget per day
        </div>
        <div style={sectionBoxStyle}>
          <div className="d-flex flex-column gap-2">
            {BUDGETS.map((b, idx) => (
                <label
                    key={b.label}
                    className="d-flex align-items-center"
                    style={{
                    cursor: "pointer",
                    fontWeight: 500,
                    color: (Array.isArray(filters.budget) && filters.budget.includes(idx)) ? "#FF6D1F" : "#16396A",
                    fontSize: 15,
                    marginBottom: 2
                    }}
                >
                    <input
                    type="checkbox"
                    checked={Array.isArray(filters.budget) && filters.budget.includes(idx)}
                    onChange={() => toggleBudget(idx)}
                    style={{
                        marginRight: 13,
                        accentColor: b.color,
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: "2px solid #DEDEDE"
                    }}
                    />
                    <span
                    style={{
                        marginRight: 12,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: b.color,
                        display: "inline-block"
                    }}
                    />
                    {b.label}
                </label>
                ))}

          </div>
          <div style={{ color: "#9DB0C0", fontSize: 15, marginTop: 14, fontWeight: 500 }}>
            Set your own budget
          </div>
          <div className="d-flex gap-2 mt-1">
            <input
              type="number"
              className="form-control"
              placeholder="Min"
              style={{ maxWidth: 85, borderRadius: 8, fontSize: 15 }}
              value={filters.customMin || ""}
              onChange={e => setFilters(f => ({ ...f, customMin: e.target.value }))}
            />
            <input
              type="number"
              className="form-control"
              placeholder="Max"
              style={{ maxWidth: 85, borderRadius: 8, fontSize: 15 }}
              value={filters.customMax || ""}
              onChange={e => setFilters(f => ({ ...f, customMax: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div style={{ marginBottom: 26 }}>
        <div style={sectionHeaderStyle}>Rating</div>
        <div style={sectionBoxStyle}>
          <div style={{ color: "#6287A7", fontWeight: 500, marginBottom: 8 }}>Show only ratings more than</div>
          <div className="d-flex flex-wrap gap-2">
            {RATINGS.map(r => (
              <button
                key={r}
                onClick={() => setRating(r)}
                style={{
                  borderRadius: 10,
                  background: filters.rating === r ? "#FF6D1F" : "#fff",
                  color: filters.rating === r ? "#fff" : "#16396A",
                  border: "2px solid #E4E9EE",
                  fontWeight: 700,
                  fontSize: 17,
                  padding: "5px 14px",
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 4,
                  boxShadow: filters.rating === r ? "0 2px 10px #FF6D1F30" : "none"
                }}
                type="button"
              >
                {r}
                <span style={{
                  marginLeft: 3,
                  color: filters.rating === r ? "#fff" : "#FF993A",
                  fontSize: 17
                }}>&#9733;</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div style={{ marginBottom: 26 }}>
        <div style={sectionHeaderStyle}>Facilities</div>
        <div style={sectionBoxStyle}>
          <div className="d-flex flex-column gap-2">
            {FACILITIES.map(fac => (
              <label key={fac.key}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  color: fac.highlight && filters[fac.key] ? "#FF6D1F" : "#16396A",
                  fontSize: 16,
                  fontWeight: 500
                }}>
                <input
                  type="checkbox"
                  checked={filters[fac.key] || false}
                  onChange={e => setFilters(fltrs => ({
                    ...fltrs,
                    [fac.key]: e.target.checked
                  }))}
                  style={{
                    marginRight: 13,
                    accentColor: "#FF6D1F",
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: "2px solid #DEDEDE"
                  }}
                />
                {fac.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Activities */}
      <div style={{ marginBottom: 26 }}>
        <div style={sectionHeaderStyle}>Activities</div>
        <div style={sectionBoxStyle}>
          <div className="d-flex flex-column gap-2">
            {ACTIVITIES.map(act => (
              <label key={act.key}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  color: act.highlight && filters[act.key] ? "#FF6D1F" : "#16396A",
                  fontSize: 16,
                  fontWeight: 500
                }}>
                <input
                  type="checkbox"
                  checked={filters[act.key] || false}
                  onChange={e => setFilters(fltrs => ({
                    ...fltrs,
                    [act.key]: e.target.checked
                  }))}
                  style={{
                    marginRight: 13,
                    accentColor: "#FF6D1F",
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: "2px solid #DEDEDE"
                  }}
                />
                {act.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Special */}
      <div style={{ marginBottom: 26 }}>
        <div style={sectionHeaderStyle}>Special</div>
        <div style={sectionBoxStyle}>
          <div className="d-flex flex-column gap-2">
            {SPECIAL.map(sp => (
              <label key={sp.key}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  color: sp.highlight && filters[sp.key] ? "#FF6D1F" : "#16396A",
                  fontSize: 16,
                  fontWeight: 500
                }}>
                <input
                  type="checkbox"
                  checked={filters[sp.key] || false}
                  onChange={e => setFilters(fltrs => ({
                    ...fltrs,
                    [sp.key]: e.target.checked
                  }))}
                  style={{
                    marginRight: 13,
                    accentColor: "#FF6D1F",
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: "2px solid #DEDEDE"
                  }}
                />
                {sp.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Clear filters */}
      <div style={{ textAlign: "center" }}>
        <button
          className="btn"
          style={{
            background: "#BFD8E7",
            border: "none",
            borderRadius: 12,
            padding: "12px 0",
            width: "90%",
            fontWeight: 600,
            fontSize: 18,
            color: "#fff",
            marginTop: 6,
            boxShadow: "0 2px 8px #bdd7ee60"
          }}
          onClick={() => setFilters({ country: filters.country })}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
