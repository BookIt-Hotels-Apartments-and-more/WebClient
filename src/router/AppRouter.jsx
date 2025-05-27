import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
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
import EditApartment from "../pages/landlord/EditApartment";





const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="hotels/:id" element={<HotelDetails />} />
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/adminpanel" element={<AdminPanel />} />  
          <Route path="/partner-auth" element={<PartnerAuth />} />
          <Route path="/landlordpanel" element={<LandPanel />} />  
          <Route path="/add-hotel" element={<AddHotel />} />
          <Route path="/edit-hotel/:id" element={<EditHotel />} />
          <Route path="/edit-apartment/:id" element={<EditApartment />} />
          <Route path="/auth/success" element={<AuthSuccess />} />  
          <Route path="/google-auth/callback" element={<GoogleCallback />} /> 
          <Route path="/auth/error" element={<AuthError />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
