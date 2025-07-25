import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import AboutUs from '../pages/AboutUs';
import WhoAreYou from '../pages/WhoAreYou';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UserPanel from '../pages/tenant/UserPanel';
import HotelDetails from '../pages/HotelDetails';
import Layout from '../components/Layout';
import LandPanel from '../pages/landlord/LandPanel';
import PartnerAuth from '../pages/landlord/PartnerAuth'
import AuthSuccess from "../pages/AuthSuccess";
import GoogleCallback from "../pages/GoogleCallback";
import AuthError from "../pages/AuthError";
import AdminPanel from '../pages/admin/AdminPanel';
import AdminAuth from '../pages/admin/AdminAuth'; 
import AddHotel from "../pages/landlord/AddHotel";
import EditHotel from "../pages/landlord/EditHotel";
import AddApartment from "../pages/landlord/AddApartment";
import EditApartment from "../pages/landlord/EditApartment";
import Countries from "../pages/Countries";
import CountrySelect from "../pages/CountrySelect";
import ScrollToTop from "../components/ScrollToTop";





const AppRouter = () => {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/userpanel" element={<UserPanel />} />
          <Route path="/whoareyou" element={<WhoAreYou />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/admin-auth" element={<AdminAuth />} />
          {/* <Route path="/adminpanel" element={<ProtectedRoute role={0}><AdminPanel /></ProtectedRoute>} />   */}
          <Route path="/adminpanel" element={<AdminPanel />} />  
          <Route path="/partner-auth" element={<PartnerAuth />} />
          {/* <Route path="/landlordpanel" element={<ProtectedRoute role={1}><LandPanel /></ProtectedRoute>} />   */}
          <Route path="/landlordpanel" element={<LandPanel />} />
          <Route path="/add-hotel" element={<AddHotel />} />
          <Route path="/edit-hotel/:id" element={<EditHotel />} />
          <Route path="/add-apartment/:establishmentId" element={<AddApartment />} />
          <Route path="/edit-apartment/:id" element={<EditApartment />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/country-select" element={<CountrySelect />} />
          <Route path="/auth/success" element={<AuthSuccess />} />  
          <Route path="/google-auth/callback" element={<GoogleCallback />} /> 
          <Route path="/auth/error" element={<AuthError />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
