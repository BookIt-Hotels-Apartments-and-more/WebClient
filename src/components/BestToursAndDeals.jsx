// src/components/BestToursAndDeals.jsx

import React from "react";

const tours = [
  {
    id: 1,
    country: "Greece",
    location: "Santorini",
    name: "Santorini Sunset Sail 4-Day Aegean Escape",
    price: 449,
    priceUnit: "$",
    per: "person",
    rating: 9.7,
    discount: null,
    img: "/images/santorini.png"
  },
  {
    id: 2,
    country: "Italy",
    location: "Positano",
    name: "Amalfi Coast Dolce Vita 3-Day Italy Beach Tour",
    price: 399,
    priceUnit: "$",
    per: "person",
    rating: 7.9,
    discount: 25,
    img: "/images/amalfi.png"
  },
  {
    id: 3,
    country: "Indonesia",
    location: "Bali",
    name: "Bali Blue Lagoon 5-Day Island Retreat",
    price: 529,
    priceUnit: "$",
    per: "person",
    rating: 8.9,
    discount: null,
    img: "/images/bali.png"
  },
  {
    id: 4,
    country: "Switzerland",
    location: "Interlaken",
    name: "Swiss Alpine Trails 4-Day Interlaken Adventure",
    price: 279,
    priceUnit: "$",
    per: "person",
    rating: 8.4,
    discount: 20,
    img: "/images/switzerlandtour.png"
  }
];

const BestToursAndDeals = () => {
  return (
    <section
      style={{
        background: "linear-gradient(to bottom, #fff 0%, #D6E7EE 20%, #D6E7EE 80%, #fff 100%)",
        borderRadius: 20,
        margin: "40px auto 0 auto",
        maxWidth: 1950,
        padding: "56px 0 48px 0",
        minHeight: 430,
        overflow: "hidden",
        alignItems: "center",
      }}
      className="mb-5"
    >
      {/* Верхній блок: текст + кнопка */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          maxWidth: 1200,
          margin: "0 auto 32px auto",
          padding: "0 36px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 4, color: "#1b3966", lineHeight: 1.13 }}>
            Best Tours and Trip Deals
          </h2>
          <div style={{ color: "#F39B38", fontWeight: 400, fontSize: 14, marginBottom: 0 }}>
            Explorer Our Tours
          </div>
        </div>
        <a
          href="#"
          style={{
            color: "#22614D",
            fontWeight: 600,
            fontSize: 16,
            textDecoration: "none",
            marginBottom: 12,
            marginLeft: 24
          }}
        >
          See all →
        </a>
      </div>

      {/* Блок турів */}
      <div
        style={{
          display: "flex",
          gap: 28,
          justifyContent: "center",
          maxWidth: 1200,
          margin: "0 auto",
          flexWrap: "nowrap",
        }}
      >
        {tours.map((tour) => (
          <div
            key={tour.id}
            style={{
              width: 260,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 1px 4px #e2e8f0",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              marginBottom: 8,
              minHeight: 316,
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={tour.img}
                alt={tour.name}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              />
              {tour.discount && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "#FF865E",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 8,
                    padding: "2px 10px",
                    fontSize: 14
                  }}
                >
                  Sale {tour.discount}%
                </div>
              )}
            </div>


            <div style={{ padding: "18px 14px 14px 14px", flex: "1 1 auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ color: "#6A778B", fontWeight: 500, fontSize: 13 }}>
                  {tour.location}, {tour.country}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img src="/images/reitingstar-orange.png" alt="rating" style={{ width: 14, marginRight: 4 }} />
                  <span style={{ fontWeight: 600, color: "#FF7800", fontSize: 13 }}>{tour.rating}</span>
                </div>
              </div>              
              
              <div style={{ fontWeight: 700, color: "#22614D", fontSize: 15, marginBottom: 3 }}>
                {tour.name}
              </div>         

              <div style={{ color: "#1b3966", fontWeight: 700, fontSize: 14 }}>
                {tour.priceUnit}{tour.price}
                <span style={{ color: "#6A778B", fontWeight: 400, fontSize: 12 }}>
                  /{tour.per}
                </span>
                <button
                className="btn btn-info mt-2"
                style={{
                  background: "#CAEDF7",
                  color: "#22614D",
                  border: "none",
                  fontWeight: 700,
                  borderRadius: 10,
                  fontSize: 14,
                  padding: "8px 20px",
                  marginTop: 10,
                  marginLeft: 20
                }}
              >
                Book Now
              </button>
              </div>
              
            </div>
          </div>
        ))}
      </div>
    </section>

  );
};

export default BestToursAndDeals;
