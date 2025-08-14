import { useEffect, useMemo, useState } from "react";
import { getEstablishmentsByVibe } from "../api/establishmentsApi";
import { VIBE_TYPE } from "../utils/enums";
import { useNavigate } from "react-router-dom";


const vibes = [
    { key: "Beach",     label: "Beach",    vibe: VIBE_TYPE.Beach,     img: "/images/beach.png" },
    { key: "Nature",    label: "Nature",   vibe: VIBE_TYPE.Nature,    img: "/images/nature.png" },
    { key: "City",      label: "City",     vibe: VIBE_TYPE.City,      img: "/images/city.png" },    
    { key: "Relax",     label: "Relax",   vibe: VIBE_TYPE.Relax,      img: "/images/relax.png" },
    { key: "Mountains", label: "Mountain", vibe: VIBE_TYPE.Mountains, img: "/images/mountain.png" },
  ];

const CARD_WIDTH = 200;
const OVERLAP = 64; 

const QuickPlanning = () => {
  const [activeVibe, setActiveVibe] = useState(VIBE_TYPE.Beach);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [cache, setCache] = useState({});

  const [hoveredIdx, setHoveredIdx] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (cache[activeVibe]) {
        setItems(cache[activeVibe]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await getEstablishmentsByVibe(activeVibe);
        if (!cancelled) {
          setItems(data || []);
          setCache(prev => ({ ...prev, [activeVibe]: data || [] }));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeVibe]);

  const handleCardClick = (vibe) => {
    navigate(`/hotels?vibe=${encodeURIComponent(vibe)}`);
  };

  return (
    <section className="my-5" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 24 }}>
        <div className="flex-grow-1" style={{ minWidth: 260 }}>
          <h2 className="fw-bold mb-2" style={{ fontSize: 24, color: "#1b3966", marginBottom: 8 }}>
            Quick and easy planning
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: 16, maxWidth: 420 }}>
            Quickly plan your vacation anywhere you want. You can choose a specific destination in two clicks, easy fast comfortable!
          </p>         
        </div>

        <div
          className="d-flex align-items-end position-relative"
          style={{
            height: CARD_WIDTH,
            minWidth: CARD_WIDTH + (vibes.length - 1) * (CARD_WIDTH - OVERLAP),
            overflow: "visible",
          }}
        >
          {vibes.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={item.key}
                className="shadow"
                tabIndex={0}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_WIDTH,
                  borderRadius: 20,
                  position: "relative",
                  marginLeft: idx === 0 ? 0 : -OVERLAP,
                  boxShadow: "0 6px 28px 0 rgba(40,46,72,0.13)",
                  background: "#fff",
                  zIndex: isHovered ? 99 : idx,
                  transition: "z-index 0.12s, box-shadow 0.22s",
                  outline: isHovered ? "2px solid #1b3966" : "none",
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-start",
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onFocus={() => setHoveredIdx(idx)}
                onBlur={() => setHoveredIdx(null)}
                onClick={() => {
                  handleCardClick(item.vibe);
                }}
              >
                <img
                  src={item.img}
                  alt={item.label}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 20,
                    zIndex: 1,
                    filter: isHovered ? "none" : "brightness(0.8) blur(1px)",
                    transition: "filter 0.22s",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickPlanning;