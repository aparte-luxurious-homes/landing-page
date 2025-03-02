import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { register } from "swiper/element/bundle";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { HelmetProvider } from 'react-helmet-async';
// import { datadogRum } from '@datadog/browser-rum';

import { store, persistor  } from "./app/store.ts";
import "./index.css";
import App from "./App.tsx";
import theme from "./theme";
import "swiper/swiper-bundle.css";
import "swiper/element/bundle";

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);