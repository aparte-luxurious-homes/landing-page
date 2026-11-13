# Aparte Landing Page - AI Agent Guide

> **Last Updated:** May 2, 2026
> **Project Type:** Customer-Facing Booking Portal for Aparte Property Platform
> **Stack:** React 18 + Vite + TypeScript + Redux Toolkit (RTK Query) + Tailwind CSS

---

## Project Overview

The **Landing Page** is the customer-facing web application for the Aparte property platform. It allows guests to discover, search, and book verified accommodations, and property owners/agents to list their properties.

> **Brand naming, non-negotiable.** Trade name: Aparte (also AparteNG). Registered entity: Aparte Digital Limited. The name 'Aparte Luxurious Homes' refers to a retired precursor business and must never be used in code, copy, metadata, or documentation going forward. Positioning is reliability, not luxury. See api-v1/docs/seo-luxury-strip-spec.md.

**This is a frontend application** that consumes the Aparte API v1 backend (`api-v1/`).

### Platform Context

Aparte has 3 repos in this workspace:
- **api-v1/** - FastAPI backend (PostgreSQL, payment gateways, wallet system)
- **admin-dashboard/** - Next.js management portal
- **landing-page/** (this repo) - React customer-facing booking site

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React | 18.3.1 |
| **Bundler** | Vite | 5.4.10 |
| **Language** | TypeScript | 5.6.2 |
| **Styling** | Tailwind CSS + MUI 6.1.7 + Emotion | 3.4.15 |
| **State** | Redux Toolkit + RTK Query + Redux Persist | 2.4.0 |
| **Routing** | React Router v6 | 6.28.0 |
| **Payments** | React Paystack 6.0.0, Flutterwave 1.3.2, Monnify SDK | - |
| **Maps** | React Google Maps API + Leaflet | 2.20.6, 1.9.4 |
| **Encryption** | CryptoJS (AES) | 4.2.0 |
| **Monitoring** | Sentry | 8.54.0 |
| **Notifications** | React Toastify | 11.0.3 |

---

## Repository Structure

```
landing-page/
├── src/
│   ├── api/                           # RTK Query API slices
│   │   ├── authApi.ts                # Signup, login, OTP, password reset
│   │   ├── propertiesApi.ts          # Property listing, units, amenities, media
│   │   ├── booking.ts                # Create booking, update status/transaction
│   │   ├── bookingsApi.ts            # Get user bookings
│   │   ├── paymentApi.ts             # Payment processing, gateway config, verification
│   │   ├── profileApi.ts             # User profile & wallet
│   │   ├── transactionsApi.ts        # Transaction history
│   │   ├── listApi.ts                # Property listing (for owners/agents)
│   │   └── types.ts                  # Shared API types
│   │
│   ├── app/                           # Redux store
│   │   ├── store.ts                  # Store config with all API slices
│   │   └── rootReducer.ts            # Combined reducers
│   │
│   ├── features/                      # Redux slices
│   │   ├── auth/authSlice.ts         # Auth state (token, role, email, phone)
│   │   └── property/propertySlice.ts # Property listing form wizard state
│   │
│   ├── pages/                         # Route pages
│   │   ├── LandingPage/HomePage.tsx  # Home page (hero + featured apartments)
│   │   ├── auth/                     # Login, signup, OTP, password reset
│   │   ├── PropertyDetails.tsx       # Full property view with booking
│   │   ├── ConfirmBooking.tsx        # Booking confirmation + payment
│   │   ├── PaymentSuccess.tsx        # Post-payment validation
│   │   ├── SearchResults.tsx         # Property search results
│   │   ├── MyAccountPage.tsx         # User account dashboard
│   │   ├── kycDetails.tsx            # KYC document upload
│   │   ├── ListApartePage.tsx        # Property listing flow container
│   │   └── listAparteFlow/           # 11-step property listing wizard
│   │       └── listFlow1-11.tsx
│   │
│   ├── components/                    # Reusable components (~50 files)
│   │   ├── ProtectedRoute.tsx        # Auth guard with login redirect
│   │   ├── header/                   # Navigation, dropdowns
│   │   ├── footer/                   # Footer sections
│   │   ├── hero/                     # Hero image component
│   │   ├── search/                   # Search bar (desktop + mobile)
│   │   ├── property/                 # Property cards, type filters
│   │   ├── account/                  # Profile, booking history, transactions
│   │   ├── pagelayout/               # Page wrapper (header + footer)
│   │   ├── skeletons/                # Loading skeletons
│   │   └── DateRangePicker.tsx
│   │
│   ├── context/
│   │   └── UserBooking.tsx           # Booking state (localStorage persistence)
│   │
│   ├── contexts/
│   │   └── LoadingContext.tsx         # Page loading indicator
│   │
│   ├── hooks/
│   │   ├── useHandleAuthError.ts     # Auto-redirect on 401/expired token
│   │   ├── usePageTitle.tsx          # Browser title with React Helmet
│   │   ├── useValidator.ts           # Form validation
│   │   └── index.ts                  # useAppDispatch, useAppSelector
│   │
│   ├── utils/
│   │   ├── secureStorage.ts          # AES encrypt/decrypt token in sessionStorage
│   │   ├── url.ts                    # API URL normalization (ensures /api/v1 suffix)
│   │   ├── errorHandler.ts           # FastAPI error extraction
│   │   └── adminRedirect.ts          # Redirect admin users to dashboard
│   │
│   ├── sections/                      # Page sections (Hero, Apartments, Footer)
│   ├── types/                         # TypeScript types (search, property)
│   ├── assets/                        # Images, styles
│   ├── App.tsx                        # React Router setup
│   ├── main.tsx                       # Entry point (React 18 StrictMode)
│   ├── theme.ts                       # MUI theme (primary: #028090)
│   └── sentry.ts                      # Error tracking setup
│
├── Dockerfile                         # Multi-stage (Node 18 → Nginx)
├── cloudbuild.yaml                    # GCP Cloud Build → Cloud Run
├── vite.config.ts                     # Dev port 3000, CSS modules, chunk splitting
├── tailwind.config.js
├── vercel.json                        # Vercel deployment config
└── package.json
```

---

## Architecture & Patterns

### State Management

**Redux Store:**
```typescript
{
  root: {                              // Persisted
    auth: { token, isAuthenticated, userRole, email, phone }
  },
  property: { ... },                   // Property listing wizard form data
  // RTK Query API slices (7 total)
  authApi, propertiesApi, paymentApi, profileApi, bookingApi, bookingsApi, transactionsApi
}
```

### Token Security
- JWT tokens encrypted with AES (CryptoJS) before storing in sessionStorage
- Secret key: `VITE_TOKEN_SECRET_KEY` from environment
- Functions in `src/utils/secureStorage.ts`: `saveToken()`, `getToken()`, `removeToken()`

### Authentication Flow

1. Signup: `POST /auth/signup` → OTP sent via email/SMS
2. OTP verification: `POST /auth/otp/verify` → JWT token returned
3. Login: `POST /auth/login` → JWT stored encrypted in sessionStorage
4. Token attached to all API requests via RTK Query `prepareHeaders`
5. `useHandleAuthError()` hook monitors for 401 → auto-logout + redirect

### Booking & Payment Flow

1. Guest searches properties → selects unit → views availability
2. Creates booking via `POST /bookings` (unit_id, dates, guests)
3. On ConfirmBooking page:
   - Profile validation (name, email, phone, DOB required)
   - Price breakdown: base_price * nights + caution_fee = total
   - Payment method: MONNIFY or WALLET
4. Payment via Monnify:
   - `POST /wallets/{id}/transactions` → get reference + payment link
   - Initialize Monnify SDK (`window.MonnifySDK.initialize()`)
   - On completion → update booking status with transaction details
5. PaymentSuccess page verifies transaction via API

### Property Listing Flow (11 Steps)
Multi-step wizard for owners/agents to list properties:
1. Property type → 2. Name/description → 3. Location → 4. Amenities → 5. Featured media → 6. Unit details → 7. Unit amenities → 8. Unit media → 9. Pricing → 10. KYC → 11. Review & submit

State tracked in `propertySlice.ts` (Redux, non-persisted).

### API Layer (RTK Query)

All API calls use RTK Query slices in `src/api/`:

```typescript
// Example: src/api/propertiesApi.ts
export const propertiesApi = createApi({
  reducerPath: 'propertiesApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_API_URL }),
  endpoints: (builder) => ({
    getProperties: builder.query({ ... }),
    createProperty: builder.mutation({ ... }),
    // ...
  })
})
```

---

## Routes

| Route | Protection | Purpose |
|-------|-----------|---------|
| `/` | Public | Home page |
| `/login`, `/signup`, `/otp` | Public | Authentication |
| `/auth/request-reset`, `/auth/reset-password` | Public | Password reset |
| `/apartment/:id` | Public | Unit view |
| `/property-details/:id` | Public | Property details |
| `/search-results` | Public | Search results |
| `/about` | Public | About page |
| `/confirm-booking` | Protected | Booking confirmation + payment |
| `/booking-validation` | Public | Payment callback |
| `/account` | Protected | User dashboard (profile, bookings, transactions) |
| `/list` | Protected | Property listing wizard |
| `/kycdetails` | Protected | KYC document upload |
| `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/blog/tag/[slug]` | Public | Blog. Server components reading api-v1 `/blog/*` through [src/lib/blog/api.ts](src/lib/blog/api.ts) (raw fetch, revalidate 60s, the same server-side exception as lib/seo/serverFetch). `?q=` searches (noindex), `?page=` paginates. Redirects and 404s are raised in `generateMetadata` as well as the page, so they are real status codes. Article HTML is sanitised by the API and rendered as-is. The only browser call is the read counter (`src/api/blogApi.ts`). Prices are written NGN |

---

## Environment Variables

```
VITE_API_BASE_URL=https://api.aparteng.com/api/v1
VITE_TOKEN_SECRET_KEY={AES encryption key}
VITE_GOOGLE_MAPS_API_KEY={Google Maps key}
VITE_ADMIN_DASHBOARD_URL=https://dashboard.aparteng.com
VITE_APP_TITLE=AparteNG
VITE_SENTRY_DSN={optional}
```

---

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # tsc + vite build
npm run preview      # Preview production build
npm run lint         # ESLint
```

## Deployment

- **Platform:** GCP Cloud Run (europe-west1)
- **Build:** Docker multi-stage (Node 18 builder → Nginx Alpine)
- **CI/CD:** Cloud Build (`cloudbuild.yaml`)
- **Resources:** Memory 256Mi, CPU 0.5
- **SPA Routing:** Nginx `try_files $uri $uri/ /index.html`
- **Port:** 8080

---

## Development Guidelines

1. **API calls** - Always use RTK Query slices in `src/api/`. Never make raw fetch/axios calls.
2. **New pages** - Add route in `src/App.tsx`, create page in `src/pages/`
3. **Protected routes** - Wrap with `<ProtectedRoute>` component
4. **Error handling** - Use `extractErrorMessage()` from `src/utils/errorHandler.ts`
5. **Token management** - Use `secureStorage.ts` functions, never access sessionStorage directly
6. **Forms** - Use `useValidator` hook for validation
7. **Styling** - Tailwind CSS first, MUI components for complex UI
8. **Theme** - MUI primary color: `#028090`, fonts: Plus Jakarta Sans (body) and Fraunces (display), self-hosted by next/font in `src/lib/fonts.ts`. Use `var(--font-sans)` / `var(--font-serif)`, never a family name. Type scale: `src/lib/typography.ts`. The property page and booking flow are sans only
9. **State** - Redux Persist only for auth (token, role, email, phone)
10. **Environment** - All config via `VITE_*` variables, normalized in `src/utils/url.ts`
11. **Components** - Reusable components in `src/components/`, page-specific inline
12. **Never hardcode API URLs** - Use `BASE_API_URL` from `src/utils/url.ts`

---

## Monitoring

- **Sentry:** 100% transaction capture, 10% session replay, 100% error replay
- **Trace propagation:** `localhost` and `api.aparteng.com`

---

## Notable conventions (added 2026-05-02)

### Numeric stepper inputs (units / guests count)
Direct binding `<input type="number" value={n}>` to a numeric state has two failure modes — typed digits append to the existing value (clicking 3 with cursor after "1" produces "13" → clamped to max), and backspacing snaps back to the fallback value. The pattern in [BookingSidebar.tsx](src/components/property/BookingSidebar.tsx) and [MobileBookingSummary.tsx](src/components/property/MobileBookingSummary.tsx) avoids both:

```tsx
const [unitsInput, setUnitsInput] = useState<string>(String(selectedUnits));
useEffect(() => { setUnitsInput(String(selectedUnits)); }, [selectedUnits]);

<input
  type="number"
  value={unitsInput}
  onFocus={(e) => e.target.select()}      // typing replaces existing digit
  onChange={(e) => {
    const raw = e.target.value;
    setUnitsInput(raw);
    if (raw === '') return;                // allow empty mid-edit
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    setSelectedUnits(Math.max(1, Math.min(n, max)));
  }}
  onBlur={() => setUnitsInput(String(selectedUnits))}  // canonicalise
  min="1"
  max={max}
/>
```

Apply this pattern to any new numeric stepper. Don't introduce a +/- stepper as the only fix — touch-typing users want to type the number; the controlled-input UX is the load-bearing piece.

### Phone-verification gate
Once the API's platform switch is on, every OWNER / AGENT / GUEST confirms their phone by SMS once (staff exempt). The pieces:

- **Sign-in answers 401 `PHONE_VERIFICATION_REQUIRED` with a `challenge`** (`/auth/login`, `/auth/google`, `/auth/otp/verify`). [AuthPage.tsx](src/views/auth/AuthPage.tsx) renders [PhoneOTPStep.tsx](src/views/auth/PhoneOTPStep.tsx) with the detail fields; every phone call sends `{challenge, ...}`. Read the error with [utils/phoneVerification.ts](src/utils/phoneVerification.ts), never by hand — it accepts both the `unwrap()` shape and the `queryFulfilled` `{error: ...}` shape.
- **Resend cooldown is the server's `resend_after_seconds`**, not a hardcoded 60. A 429 `PHONE_OTP_COOLDOWN` re-arms it; `PHONE_OTP_EXPIRED` burns the code (offer a new one); `PHONE_CHALLENGE_INVALID` sends the user back to sign in.
- **Any authenticated endpoint may answer 401 `PHONE_VERIFICATION_REQUIRED` with `reauth: true`** (no challenge). [app/authGateListener.ts](src/app/authGateListener.ts) is the one listener for all RTK APIs: it signs out and loads `/login?reason=phone_verification&redirect=...`. It keys on `reauth === true` so the sign-in endpoints' challenge variant never signs anyone out.
- `EMAIL_VERIFICATION_REQUIRED` on login goes to the email code step.
- The "send the code to my email instead" fallback is retired (`/auth/phone/request-otp-via-email` answers 410). Don't bring it back.

### Server-authoritative booking total_price
The frontend can pre-compute a total for display (e.g. `BookingSidebar` showing `basePrice * nights * selectedUnits`), but the backend recomputes from `unit.price_per_night × dates × unit_count + caution_fee` on submit and stores its own value. JS float math (`33333.33 * 3 = 99999.99000000001`) drifts cents — the backend `calculated_price` is the source of truth, the FE-sent `total_price` is now informational only and discarded on persist. Don't try to "fix" the FE math beyond `.toFixed(2)` for display; just show the server total back to the user post-confirm.

### Flexible payments (instalments / Invite Friends to Pay) — UI only, API not connected
Guest-side UI for the flexible payments PRD. The backend contract does not exist yet, so:

- [api/flexPaymentsApi.ts](src/api/flexPaymentsApi.ts) is the only place plan data is fetched or changed, and every endpoint answers `FLEX_NOT_CONNECTED` without touching the network. No invented URLs, no sample data. Wiring the real API means replacing each `queryFn` there, flipping `FLEX_PAYMENTS_API_CONNECTED` in [lib/flexPayments.ts](src/lib/flexPayments.ts), and filling the `SEAM` in `ConfirmBooking.handlePaymentMethodChange` (it must keep returning before the pay-in-full code until then).
- While the flag is false, checkout offers only pay-in-full, [PaymentPlanCard](src/components/booking/PaymentPlanCard.tsx) renders nothing, and `/pay/[token]` shows "link isn't available". `NEXT_PUBLIC_FLEX_PAYMENTS_PREVIEW=true` (non-production only) shows the checkout options with default settings for review; confirming one stops with a notice and never creates a booking.
- Plan amounts are **integer kobo**; the rest of the app is naira. Convert at the edge (`nairaToKobo` / `formatKobo`) and split with the helpers in `lib/flexPayments.ts` so shares always sum exactly. `npm run test:unit` covers them.
- Listing settings are read from `property.instalment_payment` / `property.invite_friends_payment`, the field names the admin dashboard writes.

---

**Last Updated:** May 2, 2026
**Version:** 1.0.0
