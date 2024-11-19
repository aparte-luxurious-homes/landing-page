import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { register } from "swiper/element/bundle";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";
import App from "./App.tsx";
import theme from "./theme";
import "swiper/swiper-bundle.css";
import "swiper/element/bundle";

// register Swiper custom elements
register();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
