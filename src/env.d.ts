/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ADMIN_DASHBOARD_URL: string
  readonly VITE_TOKEN_SECRET_KEY: string
  // add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 