import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/LandingPage/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import ApartmentPage from './pages/ApartmentPage';
import ListApartePage from './pages/ListApartePage';
import OTPVerification from './pages/auth/OTPVerification';
import ConfirmBookingPage from './pages/ConfirmBooking';
import PropertyDetails from './pages/PropertyDetails';
import SearchResults from './pages/SearchResults';
import AboutUs from './pages/AboutUs';
import UserTypeSection from './components/UserTypeSection';
import KycDetails from './pages/kycDetails';
import AddAmenitiesMedia from './pages/AddAmenitiesMedia';
import * as Sentry from "@sentry/react";
import { BookingProvider } from "./context/UserBooking";
import PaymentSuccess from "./pages/PaymentSuccess";
import RequestPasswordReset from './pages/auth/RequestPasswordReset';
import ResetPassword from './pages/auth/ResetPassword';
import MyAccountPage from './pages/MyAccountPage';
import ScrollToTop from './components/ScrollToTop';
import IdleTimeoutWithWarning from "./components/Idletimeout/idletimeout";

import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import { LoadingProvider } from './contexts/LoadingContext';

function ErrorFallback() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <p>Please try refreshing the page.</p>
      <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}>
        Refresh
      </button>
    </div>
  );
}

const UserTypeSelectionPage: React.FC = () => {
  const handleUserTypeSelect = () => {
  };

  return <UserTypeSection onSelect={handleUserTypeSelect} />;
};

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
    <Router>
      <ScrollToTop />
      <LoadingProvider>
        <BookingProvider>
          <IdleTimeoutWithWarning 
            idleTime={2 * 60 * 1000}
            warningTime={1 * 60 * 1000}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/apartment/:id" element={<ApartmentPage />} />
              <Route
                path="/otp"
                element={<OTPVerification email={''} phone={''} />}
              />
              <Route path="/confirm-booking" element={<ConfirmBookingPage />} />
              <Route path="/property-details/:id" element={<PropertyDetails />} />
              <Route path="/search-results" element={<SearchResults />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/auth/user-type" element={<UserTypeSelectionPage />} />
              <Route path="/login/guest" element={<LoginPage />} />
              <Route path="/login/agent" element={<LoginPage />} />
              <Route path="/login/home-owner" element={<LoginPage />} />
              
              <Route path="/kycdetails" element={<KycDetails />} />
              <Route path="/booking-validation" element={<PaymentSuccess />} />
              <Route
                path="/add-amenities-media"
                element={
                  <AddAmenitiesMedia
                    formData={{ apartmentType: '', sections: [], description: '' }}
                    setFormData={() => {}}
                  />
                }
              />
              <Route element={<ProtectedRoute />}>
                <Route path="/list" element={<ListApartePage />} />
                <Route path="/account" element={<MyAccountPage />} />
              </Route>  
              <Route path="/auth/request-reset" element={<RequestPasswordReset />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
            </Routes>
          </IdleTimeoutWithWarning>
        </BookingProvider>
      </LoadingProvider>
    </Router>
    </Sentry.ErrorBoundary>
  );
}

export default App;
