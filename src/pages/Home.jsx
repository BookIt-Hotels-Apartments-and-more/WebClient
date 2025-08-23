import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getAllEstablishments } from "../api/establishmentsApi";
import { axiosInstance } from "../api/axios";
import "react-datepicker/dist/react-datepicker.css";
import { useMemo } from "react";
import QuickPlanning from '../components/QuickPlanning';
import PopularDestinations from '../components/PopularDestinations';
import TopTrendingHotels from '../components/TopTrendingHotels';
import BestToursAndDeals from '../components/BestToursAndDeals';
import WhyChooseUs from '../components/WhyChooseUs';
import AppBanner from '../components/AppBanner';
import { toast } from 'react-toastify';


const Home = () => {
  const [search, setSearch] = useState("");
  const [hotels, setHotels] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recentHotels, setRecentHotels] = useState([]);
  const [sortBy, setSortBy] = useState(""); 
  const location = useLocation();
  


  useEffect(() => {
    getAllEstablishments().then(setHotels);
    axiosInstance.get("/api/apartments").then(res => setApartments(res.data));
    axiosInstance.get("/api/bookings").then(res => setBookings(res.data));
  }, []);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllEstablishments();
        setHotels(data);
      } catch (err) {
        console.error("❌ Помилка при завантаженні готелів:", err);
      }
    };
    fetchData();
  }, []);  

  const hotelsWithPrice = useMemo(() => {
      return hotels.map(hotel => {
        const hotelApartments = apartments.filter(a => a.establishment?.id === hotel.id);
        const prices = hotelApartments.map(a => a.price).filter(p => typeof p === "number" && !isNaN(p));
        let price = null;
        if (prices.length > 0) {
          price = Math.min(...prices);
        }
        return { ...hotel, price }; 
      });
    }, [hotels, apartments]);

    useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("recentHotels") || "[]");
    if (ids.length > 0) {
      setRecentHotels(hotelsWithPrice.filter(h => ids.includes(h.id)));
    }
  }, [hotelsWithPrice]);


  const filteredHotels = hotelsWithPrice.filter((hotel) => {
    const searchLower = search.trim().toLowerCase();
    const country = (hotel.geolocation?.country || "").toLowerCase();
    const city = (hotel.geolocation?.city || "").toLowerCase();
    return (
      hotel.name.toLowerCase().includes(searchLower) ||
      country.includes(searchLower) ||
      city.includes(searchLower)
    );
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedCountry = params.get("country");
    if (selectedCountry) {
      setSearch(selectedCountry);
    }
  }, [location.search]);
  
    const sortedHotels = [...filteredHotels].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });


  return (
    <div>
      {/* Банер */}
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
          {/* <div style={{ zIndex: 2, marginTop: -150 }}>
            <BookingBannerForm search={search} setSearch={setSearch} />
          </div>           */}
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
