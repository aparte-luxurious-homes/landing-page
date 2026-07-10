import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/LandingPage/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import ApartmentPage from './pages/ApartmentPage';
import ListRedirect from './pages/ListRedirect';
import OTPVerification from './pages/auth/OTPVerification';
import ConfirmBookingPage from './pages/ConfirmBooking';
import PropertyDetails from './pages/PropertyDetails';
import SearchResults from './pages/SearchResults';
import AboutUs from './pages/AboutUs';
import UserTypeSection from './components/UserTypeSection';
import KycDetails from './pages/kycDetails';
import AddAmenitiesMedia from './pages/AddAmenitiesMedia';
import { BookingProvider } from "./context/UserBooking";
import PaymentSuccess from "./pages/PaymentSuccess";
import RequestPasswordReset from './pages/auth/RequestPasswordReset';
import ResetPassword from './pages/auth/ResetPassword';
import MyAccountPage from './pages/MyAccountPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import ScrollToTop from './components/ScrollToTop';
import ConsentBanner from './components/ConsentBanner';
import IdleTimeoutWithWarning from "./components/Idletimeout/idletimeout";
import RequireCompleteProfile from './components/RequireCompleteProfile';
import CompleteProfile from './pages/CompleteProfile';

import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import { LoadingProvider } from './contexts/LoadingContext';
import { ToastContainer } from 'react-toastify';

import HelpHomePage from './pages/help/Home';
import HelpCategoryPage from './pages/help/Category';
import HelpArticlePage from './pages/help/Article';
import HelpSearchPage from './pages/help/Search';
import HelpFaqPage from './pages/help/Faq';
import TermsPage from './pages/legal/Terms';
import PrivacyPage from './pages/legal/Privacy';
import CancellationPage from './pages/legal/Cancellation';
import VerifyAgent from './pages/VerifyAgent';
import { HelpDrawer } from './components/help/HelpDrawer';
import { HelpTrigger } from './components/help/HelpTrigger';
import { DeepLinkBridge } from './components/help/DeepLinkBridge';

const UserTypeSelectionPage: React.FC = () => {
  const handleUserTypeSelect = () => {
  };

  return <UserTypeSection onSelect={handleUserTypeSelect} />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ConsentBanner />
      <LoadingProvider>
        <BookingProvider>
          <IdleTimeoutWithWarning
            idleTime={2 * 60 * 1000}
            warningTime={1 * 60 * 1000}
          >
            <RequireCompleteProfile>
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
              <Route path="/complete-profile" element={<CompleteProfile />} />

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
              <Route path="/list" element={<ListRedirect />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/account" element={<MyAccountPage />}>
                  <Route path="bookings/:bookingId" element={<BookingDetailsPage />} />
                </Route>
              </Route>
              <Route path="/auth/request-reset" element={<RequestPasswordReset />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />

              {/* Help center */}
              <Route path="/help" element={<HelpHomePage />} />
              <Route path="/help/search" element={<HelpSearchPage />} />
              <Route path="/help/faq" element={<HelpFaqPage />} />
              <Route path="/help/:audience" element={<HelpCategoryPage />} />
              <Route path="/help/:audience/:slug" element={<HelpArticlePage />} />

              {/* Aparte Verify — public agent credential check (QR scan target) */}
              <Route path="/verify" element={<VerifyAgent />} />

              {/* Legal */}
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPage />} />
              <Route path="/cancellation-policy" element={<CancellationPage />} />
            </Routes>
            <HelpDrawer />
            <HelpTrigger />
            <DeepLinkBridge />
            </RequireCompleteProfile>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </IdleTimeoutWithWarning>
        </BookingProvider>
      </LoadingProvider>
    </Router>
  );
}

export default App;
