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

const CustomCheckbox = ({ checked }) => (
  <span
    style={{
      display: "inline-block",
      width: 30,
      height: 30,
      background: "#fff",
      borderRadius: 8,
      border: `2px solid ${checked ? "#FF6D1F" : "#DEDEDE"}`,
      position: "relative",
      marginRight: 13,
      verticalAlign: "middle"
    }}
  >
    {checked && (
      <svg
        viewBox="0 0 26 26"
        style={{
          position: "absolute",
          top: 5,
          left: 5,
          width: 26,
          height: 26
        }}
      >
        <polyline
          points="3.5,9 7,12.5 13,5.5"
          style={{
            fill: "none",
            stroke: "#FF6D1F",
            strokeWidth: 2.5,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }}
        />
      </svg>
    )}
  </span>
);



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
        minWidth: 300,
        maxWidth: 320,
        marginBottom: 32
      }}
    >
      {/* Country */}
      {showCountry && (
        <div style={{ ...sectionBoxStyle, marginBottom: 20 }}>
          <div style={{ ...sectionHeaderStyle, borderRadius: "16px", fontSize: 18, marginBottom: 6 }}>
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

      {/* BUDGET */}
      <div style={{ ...sectionBoxStyle, marginBottom: 26, padding: 0 }}>
        <div
          style={{
            ...sectionHeaderStyle,
            borderRadius: "16px 16px 0 0",
            fontSize: 18,
            marginBottom: 0,
            textAlign: "left",
            background: "#D6E7EE",
            padding: "18px 28px 18px 28px",
          }}
        >
          Your budget per day
        </div>
        <div style={{ padding: "18px 28px 0 28px" }}>
          {BUDGETS.map((b, idx) => {
            const isOrange = b.label === "$0 - $200" || b.label === "SALE";
            const isChecked = Array.isArray(filters.budget) && filters.budget.includes(idx);

            return (
              <label
                key={b.label}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  fontWeight: 300,
                  color: isOrange
                    ? "#FF6D1F"
                    : "#16396A",
                  fontSize: 18,
                  marginBottom: 8,
                  letterSpacing: "0.02em",
                  transition: "color 0.2s",
                  ...(isChecked && isOrange && { color: "#FF6D1F" }),
                  ...(isChecked && !isOrange && { color: "#16396A" }),
                  userSelect: "none"
                }}
                onClick={() => toggleBudget(idx)}
              >
                <CustomCheckbox checked={isChecked} />
                {b.label}
              </label>
            );
          })}
          <div
            style={{
              color: "#9DB0C0",
              fontSize: 16,
              margin: 15,
              paddingBlockEnd: 20,
              fontWeight: 400,
              marginBottom: 6,
              letterSpacing: "0.01em",
            }}
          >
            Set your own budget
          </div>
        </div>
      </div>

      {/* RATING */}
      <div style={{ ...sectionBoxStyle, marginBottom: 26 }}>
        <div style={{...sectionHeaderStyle, borderRadius: "16px", fontSize: 18, marginBottom: 6}}>Rating</div>
        <div style={{ color: "#6287A7", fontWeight: 500, marginBottom: 8, marginTop: 10, marginLeft: 20 }}>Show only ratings more than</div>
        <div className="d-flex flex-wrap gap-2" style={{marginLeft: 20, alignItems: "center"}}>
          {RATINGS.map(r => (
            <button
              key={r}
              onClick={() => setRating(r)}
              style={{
                borderRadius: 10,
                background: filters.rating === r ? "#FF6D1F" : "#fff",
                color: filters.rating === r ? "#fff" : "#FF6D1F",
                border: "2px solid #E4E9EE",
                fontWeight: 700,
                fontSize: 14,
                width: 50,
                padding: "5px 10px",
                display: "flex",
                alignItems: "center",
                boxShadow: filters.rating === r ? "0 2px 10px #FF6D1F30" : "none"
              }}
              type="button"
            >
              {r}
              <span style={{
                marginLeft: 3,
                color: filters.rating === r ? "#fff" : "#FF993A",
                fontSize: 15
              }}>&#9733;</span>
            </button>
          ))}
        </div>
      </div>

      {/* FACILITIES */}
      <div style={{ ...sectionBoxStyle, marginBottom: 26 }}>
        <div style={{ ...sectionHeaderStyle, borderRadius: "16px", fontSize: 18, marginBottom: 6 }}>
          Facilities
        </div>
        <div className="d-flex flex-column gap-2" style={{ marginTop: 10, marginLeft: 20 }}>
          {FACILITIES.map(fac => {
            const isChecked = filters[fac.key] || false;
            return (
              <label
                key={fac.key}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  color: isChecked ? "#FF6D1F" : "#16396A",
                  fontSize: 14,
                  fontWeight: 400,
                  marginBottom: 4,
                  transition: "color 0.2s",
                  userSelect: "none"
                }}
                onClick={() =>
                  setFilters(fltrs => ({
                    ...fltrs,
                    [fac.key]: !isChecked
                  }))
                }
              >
                <CustomCheckbox checked={isChecked} />
                {fac.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* ACTIVITIES */}
      <div style={{ ...sectionBoxStyle, marginBottom: 26 }}>
        <div style={{ ...sectionHeaderStyle, borderRadius: "16px", fontSize: 18, marginBottom: 6 }}>
          Activities
        </div>
        <div className="d-flex flex-column gap-2" style={{ marginTop: 10, marginLeft: 20 }}>
          {ACTIVITIES.map(act => {
            const isChecked = filters[act.key] || false;
            return (
              <label
                key={act.key}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  color: isChecked ? "#FF6D1F" : "#16396A",
                  fontSize: 14,
                  fontWeight: 400,
                  marginBottom: 4,
                  transition: "color 0.2s",
                  userSelect: "none"
                }}
                onClick={() =>
                  setFilters(fltrs => ({
                    ...fltrs,
                    [act.key]: !isChecked
                  }))
                }
              >
                <CustomCheckbox checked={isChecked} />
                {act.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* SPECIAL */}
      <div style={{ ...sectionBoxStyle, marginBottom: 26 }}>
        <div style={{ ...sectionHeaderStyle, borderRadius: "16px", fontSize: 18, marginBottom: 6 }}>
          Special
        </div>
        <div className="d-flex flex-column gap-2" style={{ marginTop: 10, marginLeft: 20 }}>
          {SPECIAL.map(sp => {
            const isChecked = filters[sp.key] || false;
            return (
              <label
                key={sp.key}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  color: isChecked ? "#FF6D1F" : "#16396A",
                  fontSize: 14,
                  fontWeight: 400,
                  marginBottom: 4,
                  transition: "color 0.2s",
                  userSelect: "none"
                }}
                onClick={() =>
                  setFilters(fltrs => ({
                    ...fltrs,
                    [sp.key]: !isChecked
                  }))
                }
              >
                <CustomCheckbox checked={isChecked} />
                {sp.label}
              </label>
            );
          })}
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
