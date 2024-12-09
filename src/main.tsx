import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { register } from "swiper/element/bundle";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import "./index.css";
import App from "./App.tsx";
import theme from "./theme";
import "swiper/swiper-bundle.css";
import "swiper/element/bundle";

// register Swiper custom elements
register();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
   <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
