import React from "react";
import { useNavigate } from "react-router-dom";

const WhoAreYou = () => {
    const navigate = useNavigate();

    
  return (
    <div
      style={{
        minHeight: "100vh",
         backgroundImage: `
            linear-gradient(
                to bottom,
                rgba(255,255,255,0.95) 0%,
                rgba(255,255,255,0.10) 20%,
                rgba(255,255,255,0) 60%
            ),
            url('/images/signin.png')
            `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginTop: "-110px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.65)",
          borderRadius: "24px",
          padding: "48px 32px 48px 32px",
          minWidth: 480,
          width: 1100,
          height: 450,
          marginTop: 80,
          boxShadow: "0 4px 32px 0 rgba(31, 38, 135, 0.13)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Outline-текст ЗВЕРХУ */}
        <div
          style={{
            width: "100%",
            maxWidth: 1150,
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontFamily: "'Sora', Arial, sans-serif",
              fontWeight: 700,
              fontSize: 60,
              lineHeight: 1.1,
              color: "transparent",
              WebkitTextStroke: "1.5px #fff",
              textStroke: "1.5px #fff",
              letterSpacing: "0px",
              display: "inline-block",
            }}
          >
            START YOUR JOURNEY WITH US
          </span>
        </div>

        {/* Основний заголовок */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 500,
            color: "#0D3878",
            marginBottom: 44,
            fontFamily: "'Sora', Arial, sans-serif",
            textAlign: "center",
            lineHeight: "1.1",
          }}
        >
          Who Are You
        </div>

        {/* Кнопки */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "32px",
            marginTop: "8px",
          }}
        >
          <button
            className="btn"
              onClick={() => {
                localStorage.setItem("registerRole", "Tenant");
                localStorage.setItem("whoareyou", "traveler");
                navigate("/register", { state: { role: "Tenant" } });
              }}
            style={{
              fontWeight: 700,
              fontSize: 22,
              minWidth: 250,
              minHeight: 180,
              borderRadius: 18,
              color: "#173A6A",
              border: "2px solid #b7cde3",
              transition: "background 0.2s, color 0.2s",
              boxShadow: "0 4px 18px 0 rgba(31, 38, 135, 0.08)",
            }}
          >
            TRAVELER
          </button>
          <span style={{ fontWeight: 500, color: "#8a99b3", fontSize: 22 }}>
            or
          </span>
          <button
            className="btn"
              onClick={() => {
                localStorage.setItem("registerRole", "Landlord");
                localStorage.setItem("whoareyou", "landlord");
                navigate("/register", { state: { role: "Landlord" } });
              }}
            style={{
              fontWeight: 700,
              fontSize: 22,
              minWidth: 250,
              minHeight: 180,
              borderRadius: 18,
              color: "#173A6A",
              border: "2px solid #b7cde3",
              transition: "background 0.2s, color 0.2s",
              boxShadow: "0 4px 18px 0 rgba(31, 38, 135, 0.08)",
            }}
          >
            LANDLORD
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhoAreYou;
