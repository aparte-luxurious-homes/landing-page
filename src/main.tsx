import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { register } from "swiper/element/bundle";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { HelmetProvider } from 'react-helmet-async';
// import { datadogRum } from '@datadog/browser-rum';

import { GoogleOAuthProvider } from "@react-oauth/google";

import { store, persistor } from "./app/store.ts";
import "./index.css";
import App from "./App.tsx";
import { initSentry } from "./sentry";
import { getConsent, initGa, initClarity } from "./analytics";
import theme from "./theme";

// Initialize Sentry
initSentry();

// Returning visitors who already accepted: start analytics immediately.
// First-time visitors are prompted by <ConsentBanner />, which inits on accept.
if (getConsent() === "granted") {
  initGa();
  initClarity();
}
import "swiper/swiper-bundle.css";
import "swiper/element/bundle";
import 'react-toastify/dist/ReactToastify.css';

// Initialize Datadog RUM
// datadogRum.init({
//   applicationId: "APPLICATION_ID",
//   clientToken: "CLIENT_TOKEN",
//   site: "datadoghq.com", // Use "datadoghq.eu" for EU accounts
//   service: "your-service-name",
//   env: "production", // Change to "development" or "staging" as needed
//   version: "1.0.0",
//   sessionSampleRate: 100, // Percentage of sessions to track (0-100)
//   sessionReplaySampleRate: 100, // Optional: Percentage of sessions for replay
//   trackUserInteractions: true, // Enable interaction tracking
//   defaultPrivacyLevel: "mask-user-input", // Options: "mask-user-input" or "allow"
// });

// // Optional: Start session replay recording if needed
// datadogRum.startSessionReplayRecording();

// register Swiper custom elements
register();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const appTree = (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>{appTree}</HelmetProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);