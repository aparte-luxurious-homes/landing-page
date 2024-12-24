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


 import "./App.css";



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
      <Route path="/otp"  element={<OTPVerification/>} />
      <Route path="/confirm-booking" element={<ConfirmBookingPage/>} />
    </Routes>
    <Partner/>
    <Footer/>
  </Router>
  );
}

export default App;
