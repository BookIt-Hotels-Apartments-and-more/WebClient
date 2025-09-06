import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { WizardProvider } from "../features/establishment/WizardContext";
import ProtectedRoute from '../components/ProtectedRoute';
import ScrollToTop from "../components/ScrollToTop";

import Layout from '../components/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';

const AboutUs = lazy(() => import('../pages/AboutUs'));
const WhoAreYou = lazy(() => import('../pages/WhoAreYou'));
const UserPanel = lazy(() => import('../pages/tenant/UserPanel'));
const HotelDetails = lazy(() => import('../pages/HotelDetails'));
const HotelsList = lazy(() => import('../pages/HotelsList'));
const Apartments = lazy(() => import('../pages/Apartments'));
const Booking = lazy(() => import('../pages/Booking'));
const Countries = lazy(() => import('../pages/Countries'));
const CountrySelect = lazy(() => import('../pages/CountrySelect'));

const LandPanel = lazy(() => import('../pages/landlord/LandPanel'));
const PartnerAuth = lazy(() => import('../pages/landlord/PartnerAuth'));
const AddHotel = lazy(() => import('../pages/landlord/AddHotel'));
const EditHotel = lazy(() => import('../pages/landlord/EditHotel'));
const AddApartment = lazy(() => import('../pages/landlord/AddApartment'));
const EditApartment = lazy(() => import('../pages/landlord/EditApartment'));

const AdminPanel = lazy(() => import('../pages/admin/AdminPanel'));
const AdminAuth = lazy(() => import('../pages/admin/AdminAuth'));

const EstablishmentWizard = lazy(() => import('../pages/user/EstablishmentWizard'));
const Account = lazy(() => import('../pages/user/AccountHome'));
const RegisterLanding = lazy(() => import('../pages/user/RegisterLanding'));
const AddProperty = lazy(() => import('../pages/user/AddProperty'));

const AuthSuccess = lazy(() => import('../pages/AuthSuccess'));
const GoogleCallback = lazy(() => import('../pages/GoogleCallback'));
const AuthError = lazy(() => import('../pages/AuthError'));
const EmailVerified = lazy(() => import('../pages/EmailVerified'));
const PasswordReset = lazy(() => import('../pages/PasswordReset'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <WizardProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/userpanel" element={<UserPanel />} />
              <Route path="/whoareyou" element={<WhoAreYou />} />
              <Route path="/register" element={<Register />} />
              <Route path="/accounthome" element={<Account />} />
              <Route path="/registerlanding" element={<RegisterLanding />} />
              <Route path="/addproperty" element={<AddProperty />} />
              <Route path="/add-establishment/step/:step" element={<EstablishmentWizard />} />
              <Route path="/add-establishment/step/:step/:establishmentId" element={<EstablishmentWizard />} />
              <Route path="/add-establishment" element={<Navigate to="/add-establishment/step/1" replace />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />
              <Route path="/hotels" element={<HotelsList />} />
              <Route path="/admin-auth" element={<AdminAuth />} />
              <Route 
                path="/adminpanel" 
                element={
                  <ProtectedRoute role={0}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />  
              <Route 
                path="/landlordpanel" 
                element={
                  <ProtectedRoute role={1}>
                    <LandPanel />
                  </ProtectedRoute>
                } 
              />  
              <Route path="/partner-auth" element={<PartnerAuth />} />
              <Route path="/add-hotel" element={<AddHotel />} />
              <Route path="/edit-hotel/:id" element={<EditHotel />} />
              <Route path="/add-apartment/:establishmentId" element={<AddApartment />} />
              <Route path="/edit-apartment/:id" element={<EditApartment />} />
              <Route path="/countries" element={<Countries />} />
              <Route path="/country-select" element={<CountrySelect />} />
              <Route path="/auth/success" element={<AuthSuccess />} />  
              <Route path="/google-auth/callback" element={<GoogleCallback />} /> 
              <Route path="/auth/error" element={<AuthError />} />
              <Route path="/email-confirmed" element={<EmailVerified />} />
              <Route path="/auth/reset-password" element={<PasswordReset />} />
              <Route path="/apartments" element={<Apartments />} />         
            </Route>
          </Routes>
        </Suspense>
      </WizardProvider>      
    </BrowserRouter>
  );
};

export default AppRouter;