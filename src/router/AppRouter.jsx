import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { WizardProvider } from "../features/establishment/WizardContext";
import ProtectedRoute from '../components/ProtectedRoute';
import Step1Name from "../pages/user/Step1Name";
import Step2Location from "../pages/user/Step2Location";
import Step3Feature from "../pages/user/Step3Feature";
import Step4Description from '../pages/user/Step4Description';
import Step5Photos from '../pages/user/Step5Photos';
import Step6Publication from '../pages/user/Step6Publication';
import Step7Addapartment from '../pages/user/Step7Addapartment';

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
import HotelsList from "../pages/HotelsList";
import Apartments from "../pages/Apartments";
import Account from "../pages/user/AccountHome";
import RegisterLanding from "../pages/user/RegisterLanding";
import AddProperty from "../pages/user/AddProperty";
import Booking from "../pages/Booking";
import EmailVerified from '../pages/EmailVerified';
import PasswordReset from '../pages/PasswordReset';

const AppRouter = () => {
  return (
    <BrowserRouter>
    <ScrollToTop />
    <WizardProvider>
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
          <Route path="/add-establishment/step-1" element={<Step1Name />} />
          <Route path="/add-establishment/step-2" element={<Step2Location />} />
          <Route path="/add-establishment/step-3" element={<Step3Feature />} />
          <Route path="/add-establishment/step-4" element={<Step4Description />} />
          <Route path='/add-establishment/step-5' element={<Step5Photos />} />
          <Route path='/add-establishment/step-6' element={<Step6Publication />} />
          <Route path='/add-establishment/step-7' element={<Step7Addapartment />} />
          <Route path="/add-establishment/step-7/:establishmentId" element={<Step7Addapartment />} />

          <Route path="/booking" element={<Booking />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/hotels" element={<HotelsList />} />
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/adminpanel" element={<ProtectedRoute role={0}><AdminPanel /></ProtectedRoute>} />  
          <Route path="/landlordpanel" element={<ProtectedRoute role={1}><LandPanel /></ProtectedRoute>} />  
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
    </WizardProvider>      
    </BrowserRouter>
  );
};

export default AppRouter;
