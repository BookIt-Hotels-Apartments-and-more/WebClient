import { Link } from "react-router-dom";
import { getEstablishmentTypeName } from "../utils/enums";


const HotelCard = ({
  hotel,
  isFavorite,
  onToggleFavorite,
  minPrice,
  showLimitedOffer,
}) => (
  <div className="position-relative rounded-4 overflow-hidden bg-white" style={{ minHeight: 320, boxShadow: "0 2px 8px #e2e8f0" }}>
    {/* Limited offer */}
    {showLimitedOffer && (
      <div style={{
        position: "absolute", left: 20, top: 16,
        background: "#11456D", color: "#fff",
        borderRadius: 12, fontWeight: 700, fontSize: 16,
        padding: "2px 18px", zIndex: 2, 
      }}>
        Limited offer
      </div>
    )}
    {/* Favorite (Heart) */}
    <button
      style={{
        position: "absolute", right: 20, top: 16,
        background: "rgba(255,255,255,0.95)", borderRadius: "50%",
        border: "none", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
        boxShadow: "0 0 12px #eee", color: "#BF9D78"
      }}
      onClick={onToggleFavorite}
    >
      <img src="/images/favorite.png" alt="favorite" style={{ width: 38, filter: isFavorite ? "none" : "grayscale(1)" }} />
    </button>

    {/* Фонова картинка */}
    <img
      src={hotel.photos?.[0]?.blobUrl || "/noimage.png"}
      alt={hotel.name}
      style={{
        width: "100%",
        height: 170,
        objectFit: "cover",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        background: "#eee",
        display: "block"
      }}
    />

    {/* Блок з інфою */}
    <div style={{
      position: "relative", padding: "15px 10px 12px 15px",
      background: "rgba(255,255,255,0.97)", minHeight: 130,
      borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
      display: "flex", flexDirection: "column", justifyContent: "space-around"
    }}>
      {/* Тип + рейтинг */}
      <div className="d-flex align-items-center justify-content-between mb-1">
        <div className="d-flex align-items-center justify-content-between mb-1">
            <img src="/images/hotel.png" alt="rating" style={{ marginRight: 5, width: 16 }} />
            <div style={{ fontWeight: 700, fontSize: 14, color: "#18606C" }}>
                {getEstablishmentTypeName(hotel.type)}
            </div>
        </div>
        
        <div style={{
           color: "#FF7800", fontWeight: 700,
          fontSize: 16, borderRadius: 9, padding: "2px 14px 2px 8px",
          display: "flex", alignItems: "center"
        }}>
            <img src="/images/reitingstar-orange.png" alt="rating" style={{ marginRight: 5, width: 16 }} />
          {typeof hotel.rating?.generalRating === "number"
            ? hotel.rating.generalRating.toFixed(1)
            : "—"}        
        </div>
      </div>
      
      {/* Назва готелю */}
      <div style={{ fontWeight: 700, fontSize: 16, color: "#18606C" }}>{hotel.name}</div>

      {/* Опис */}
      <div style={{ fontWeight: 200, color: "#222", fontSize: 14, marginBottom: 7, maxWidth: 300 }}>
        {hotel.description || "Modern hotel with stunning views."}
      </div>
      <div className="d-flex align-items-center justify-content-between mt-2">

        {/* Ціна */}
        <div style={{ fontWeight: 700, color: "#11456D", fontSize: 16 }}>
          {minPrice ? `${minPrice}$ / night` : ""}
        </div>

        {/* More Details */}
        <Link
          to={`/hotels/${hotel.id}`}
          className="btn btn-outline-primary px-4 rounded-pill fw-semibold" style={{background: '#97CADB', color: '#1b3966'}}
        >
          More details
        </Link>
      </div>
    </div>
  </div>
);

export default HotelCard;
