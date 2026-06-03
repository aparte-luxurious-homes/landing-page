/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_KEY: string
  readonly VITE_TOKEN_SECRET_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_ADMIN_DASHBOARD_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GA4_MEASUREMENT_ID: string
  readonly VITE_CLARITY_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Globals injected by the GA4 (gtag.js) and Microsoft Clarity tags. Declared as
// an ambient interface merge — do NOT add an import/export to this file or it
// becomes a module and the ImportMetaEnv augmentation above stops being global.
interface Window {
  dataLayer: unknown[]
  gtag: (...args: unknown[]) => void
  clarity?: (...args: unknown[]) => void
}