import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import QuickPlanning from '../components/QuickPlanning';
import PopularDestinations from '../components/PopularDestinations';
import TopTrendingHotels from '../components/TopTrendingHotels';
import BestToursAndDeals from '../components/BestToursAndDeals';
import WhyChooseUs from '../components/WhyChooseUs';
import AppBanner from '../components/AppBanner';
import { toast } from 'react-toastify';

const Home = () => {
  const [search, setSearch] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedCountry = params.get("country");
    if (selectedCountry) {
      setSearch(selectedCountry);
    }
  }, [location.search]);

  return (
    <div>
      <div className='baner'
        style={{
          width: "100%",
          maxWidth: "1955px",
          minHeight: "587px",
          backgroundImage: "url('/images/mainbaner.png')",
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
        }}>          
      </div>
      
      <QuickPlanning />
      <PopularDestinations search={search} />
      <TopTrendingHotels search={search} />
      <BestToursAndDeals />
      <WhyChooseUs />
      <AppBanner />

      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          marginTop: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
          cursor: "pointer",
        }}
        onClick={() =>
          toast.info(
            "You can add your review about the booking or apartment in your personal account.",
            { autoClose: 4000 }
          )
        }
        title="Go to your account to leave a review"
      >
        <img
          src="/images/addcomment.png"
          alt=""
          style={{
            maxWidth: "1000px",
            width: "100%",
            height: "auto",
            display: "block",
            pointerEvents: "none"
          }}
        />
      </div>
    </div>  
);
};

export default Home;
