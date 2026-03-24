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
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}