import { useState } from "react";
import BookingBannerForm from '../components/BookingBannerForm';
import Breadcrumbs from '../components/Breadcrumbs';
import { useNavigate } from "react-router-dom";
import countriesList from "../utils/countriesList";

const filters = ["Beach", "Nature", "City", "Mountains", "Relax"];

export default function Countries() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleCountryClick = (countryName) => {
    navigate(`/country-select?country=${encodeURIComponent(countryName)}`);
  };

  const filteredCountries =
    selectedFilter === "All"
      ? countriesList
      : countriesList.filter((c) => c.types.includes(selectedFilter));

  return (
    <div className="countries-page" style={{ background: "#f6fafc", minHeight: "100vh" }}>
        <div
        className="baner"
        style={{
          width: "100%",
          maxWidth: "1955px",
          minHeight: "587px",
          backgroundImage: "url('/images/homebaner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          margin: "0 auto",
          marginTop: "-110px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <div style={{ zIndex: 2, marginTop: -100 }}>
          <BookingBannerForm search={search} setSearch={setSearch} />
        </div>
        <span
          style={{
            position: 'absolute',
            left: '25%',
            top: '80%',
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Sora', Arial, sans-serif",
            fontWeight: 300,
            fontSize: 50,
            lineHeight: 1.1,
            color: "white",
            WebkitTextStroke: "1.5px #fff",
            textStroke: "1.5px #fff",
            letterSpacing: "0px",
            whiteSpace: 'pre-line',
            }}
            >
            <span>Quick and Easy</span>
            <br />
            <span style={{ fontSize: 56 }}>PLANNING</span>
          </span>        
      </div>
              
            <div className="breadcrumbs" style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    maxWidth: 1400,
                    margin: "0px auto 0 auto",
                    padding: "0 24px"
                    }}>
                <Breadcrumbs
                    items={[
                        { label: "Main page", to: "/" },
                        { label: "Quick and easy planning" }
                    ]}
                    />
                
                    <div style={{ margin: "20px 0" }}>
                        {filters.map((f) => (
                            <button
                            key={f}
                            style={{
                                margin: "0 8px",
                                padding: "7px 18px",
                                background: selectedFilter === f ? "#1b3966" : "#fff",
                                color: selectedFilter === f ? "#fff" : "#1b3966",
                                border: "1px solid #1b3966",
                                borderRadius: "8px",
                                fontWeight: 500,
                                cursor: "pointer",
                                fontSize: 16,
                                transition: "all 0.2s",
                            }}
                            onClick={() => setSelectedFilter(f)}
                            >
                            {f}
                            </button>
                        ))}
                        <button
                            style={{
                            margin: "0 8px",
                            padding: "7px 18px",
                            background: selectedFilter === "All" ? "#1b3966" : "#fff",
                            color: selectedFilter === "All" ? "#fff" : "#1b3966",
                            border: "1px solid #1b3966",
                            borderRadius: "8px",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontSize: 16,
                            }}
                            onClick={() => setSelectedFilter("All")}
                        >
                            All
                        </button>
                    </div>
            </div>
       
              
             
      <div  style={{padding: "40px 0", maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center",}}>
        <h1 style={{ fontWeight: 700, fontSize: 26, color: "#1b3966", textAlign: "left", marginLeft: 20 }}>
            Choose your destination
        </h1>
        </div>

      <div
        className="countries-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "32px",
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 24px 40px 24px",
        }}
      >
        {filteredCountries.map((country) => (
          <div
            key={country.name}
            style={{
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 2px 16px #0001",
              background: "#fff",
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onClick={() => handleCountryClick(country.name)}
          >
            <img
              src={country.img}
              alt={country.name}
              style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: "20px 20px 0 0" }}
            />           
          </div>
        ))}
      </div>
    </div>
  );
}
