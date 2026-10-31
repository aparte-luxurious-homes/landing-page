// Ambient declarations. Do NOT add an import/export to this file: it would
// become a module and the global interface merges below would stop applying.

// Client env vars. Next inlines `process.env.NEXT_PUBLIC_*` at build time; read
// them through src/config/env.ts rather than directly.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_API_BASE_URL?: string
    readonly NEXT_PUBLIC_SITE_URL?: string
    readonly NEXT_PUBLIC_TOKEN_SECRET_KEY?: string
    readonly NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string
    readonly NEXT_PUBLIC_ADMIN_DASHBOARD_URL?: string
    readonly NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string
    readonly NEXT_PUBLIC_GA4_MEASUREMENT_ID?: string
    readonly NEXT_PUBLIC_CLARITY_PROJECT_ID?: string
    /**
     * Support WhatsApp number (a human): country code + national number, no
     * leading + or 00 (e.g. "2348012345678"). Unset hides every support
     * WhatsApp affordance.
     */
    readonly NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER?: string
    /**
     * Booking-bot WhatsApp number ("Aparte on WhatsApp"), same format. Unset
     * hides every "Book on WhatsApp" CTA.
     */
    readonly NEXT_PUBLIC_WHATSAPP_BOT_NUMBER?: string
  }
}

// Globals injected by the GA4 (gtag.js) and Microsoft Clarity tags.
interface Window {
  dataLayer: unknown[]
  gtag: (...args: unknown[]) => void
  clarity?: (...args: unknown[]) => void
}
