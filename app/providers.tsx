"use client";

/**
 * The whole client-side provider stack, ported from the old main.tsx and the
 * wrapper layers in App.tsx.
 *
 * Everything here is client-only by necessity: the Redux store seeds from
 * sessionStorage, redux-persist writes to localStorage, and MUI's theme needs
 * emotion's context. Server components render around this — a page that wants
 * real SSR must not depend on anything inside it.
 */

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Suspense, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";

import ConsentBanner from "@/components/ConsentBanner";
import MixpanelInit from "@/components/MixpanelInit";
import ScrollToTop from "@/components/ScrollToTop";
import IdleTimeoutWithWarning from "@/components/Idletimeout/idletimeout";
import RequireCompleteProfile from "@/components/RequireCompleteProfile";
import { DeepLinkBridge } from "@/components/help/DeepLinkBridge";
import { HelpDrawer } from "@/components/help/HelpDrawer";
import { HelpTrigger } from "@/components/help/HelpTrigger";
import { GOOGLE_CLIENT_ID } from "@/config/env";
import { BookingProvider } from "@/context/UserBooking";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { persistor, store } from "@/app/store";
import theme from "@/theme";

/**
 * PersistGate reads localStorage, so it must not run on the server pass.
 * Render children directly until mounted, then hand over to the gate.
 */
function PersistBoundary({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{children}</>;
  return (
    <PersistGate loading={null} persistor={persistor}>
      {children}
    </PersistGate>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const content = (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ConsentBanner />
        <MixpanelInit />
        <ScrollToTop />
        <LoadingProvider>
          <BookingProvider>
            <IdleTimeoutWithWarning
              idleTime={2 * 60 * 1000}
              warningTime={1 * 60 * 1000}
            >
              <RequireCompleteProfile>
                {children}
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
      </ThemeProvider>
    </AppRouterCacheProvider>
  );

  /*
   * The Suspense boundary wraps everything, not just {children}:
   * useSearchParams() opts a route out of static prerendering unless it sits
   * under one, and the router shim uses it in both useSearchParams and
   * useLocation — which ConsentBanner, the context providers and the help
   * widgets all reach transitively. One boundary here covers every route
   * instead of ~20 individual ones.
   *
   * HelmetProvider is gone: every indexable route now sets its head via Next
   * `metadata` / `generateMetadata`, and the last three transactional pages
   * use the plain-DOM usePageTitle hook.
   */
  return (
    <Provider store={store}>
      <PersistBoundary>
        <Suspense fallback={null}>
          {GOOGLE_CLIENT_ID ? (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              {content}
            </GoogleOAuthProvider>
          ) : (
            content
          )}
        </Suspense>
      </PersistBoundary>
    </Provider>
  );
}
