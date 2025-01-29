import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/LandingPage/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import Header from "./sections/Header";
import Footer from "./sections/Footer";
import Partner from "./sections/Partner";
import ApartmentPage from './pages/ApartmentPage';
import ListApartePage from "./pages/ListApartePage";
import OTPVerification from "./pages/auth/OTPVerification";
import ConfirmBookingPage from "./pages/ConfirmBooking";
import PropertyDetails from "./pages/PropertyDetails";
import SearchResults from "./pages/SearchResults";
import AboutUs from "./pages/AboutUs";
import UserTypeSection from "./components/UserTypeSection"; 
import KycDetails from "./pages/kycDetails";
import AddAmenitiesMedia from "./pages/AddAmenitiesMedia";

 import "./App.css";


 const UserTypeSelectionPage: React.FC = () => {

  const handleUserTypeSelect = () => {
    /* const searchParams = new URLSearchParams(window.location.search);
    const action = searchParams.get("action");
    if (action) {
      navigate(`/${action}/${userType}`);
    } */
  };

  return <UserTypeSection onSelect={handleUserTypeSelect} />;
};


function App() {
  return (
    <Router>
    <Header />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/apartment/:id" element={<ApartmentPage />} />
      <Route path="/list" element={<ListApartePage />} />
      <Route path="/otp"  element={<OTPVerification email={""} phone={""}/>} />
      <Route path="/confirm-booking" element={<ConfirmBookingPage/>} />
      <Route path="/property-details" element={<PropertyDetails/>} />
      <Route path="/search-results" element={<SearchResults/>} />
      <Route path="/about" element={<AboutUs/>} />
      <Route path="/auth/user-type" element={<UserTypeSelectionPage />} />
      <Route path="/login/guest" element={<LoginPage />} />
      <Route path="/login/agent" element={<LoginPage />} />
      <Route path="/login/home-owner" element={<LoginPage />} />
      <Route path="/kycdetails" element={<KycDetails/>} />
      <Route path="/add-amenities-media" element={<AddAmenitiesMedia formData={{apartmentType: '', sections: [], description: ''}} setFormData={() => {}} />} />
      {/* <Route path="/signup" element={<SignUpPage />} /> */}
      {/* <Route path="/signup/agent" element={<SignUpPage />} /> */}
      {/* <Route path="/signup/home-owner" element={<SignUpPage />} /> */}
    </Routes>
    <Partner/>
    <Footer/>
  </Router>
  );
}

export default App;
