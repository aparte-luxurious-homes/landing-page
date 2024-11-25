import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/LandingPage/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import Header from "./sections/Header";
import Footer from "./sections/Footer";
import Partner from "./sections/Partner";
import ApartmentPage from './pages/ApartmentPage';

 import "./App.css";



function App() {
  return (
    <Router>
    <Header />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/apartment" element={<ApartmentPage />} />
    </Routes>
    <Partner/>
    <Footer/>
  </Router>
  );
}

export default App;
