import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import HotelDetails from '../pages/HotelDetails';
import Layout from '../components/Layout';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="hotels/:id" element={<HotelDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
