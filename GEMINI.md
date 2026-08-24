# Aparte Landing Page - Gemini Agent Guide

> **Last Updated:** March 2, 2026
> **Project Type:** Customer-Facing Booking Portal for Aparte Property Platform
> **Stack:** React 18 + Vite + TypeScript + Redux Toolkit (RTK Query) + Tailwind CSS

---

## Project Overview

The **Landing Page** is the customer-facing web app for Aparte. Guests search and book verified accommodations.

> **Brand naming, non-negotiable.** Trade name: Aparte (also AparteNG). Registered entity: Aparte Digital Limited. The name 'Aparte Luxurious Homes' refers to a retired precursor business and must never be used in code, copy, metadata, or documentation going forward. Positioning is reliability, not luxury. See api-v1/docs/seo-luxury-strip-spec.md. Owners/agents list their properties via an 11-step wizard.

**This is a frontend app** consuming the Aparte API v1 backend (`api-v1/`).

### Platform Context
- **api-v1/** - FastAPI backend
- **admin-dashboard/** - Next.js management portal
- **landing-page/** (this repo) - React customer-facing site

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React | 18.3.1 |
| **Bundler** | Vite | 5.4.10 |
| **Language** | TypeScript | 5.6.2 |
| **Styling** | Tailwind CSS + MUI | 3.4.15, 6.1.7 |
| **State** | Redux Toolkit + RTK Query + Redux Persist | 2.4.0 |
| **Routing** | React Router v6 | 6.28.0 |
| **Payments** | Monnify SDK, React Paystack, Flutterwave | - |
| **Maps** | React Google Maps + Leaflet | 2.20.6, 1.9.4 |
| **Encryption** | CryptoJS (AES) | 4.2.0 |
| **Monitoring** | Sentry | 8.54.0 |

---

## Repository Structure

```
landing-page/
├── src/
│   ├── api/                    # RTK Query slices (7 APIs)
│   │   ├── authApi.ts         # Signup, login, OTP, password reset
│   │   ├── propertiesApi.ts   # Property, unit, amenity, media CRUD
│   │   ├── booking.ts         # Create booking, update status
│   │   ├── bookingsApi.ts     # Get user bookings
│   │   ├── paymentApi.ts      # Payment, gateway config, verification
│   │   ├── profileApi.ts      # Profile & wallet
│   │   └── transactionsApi.ts # Transaction history
│   │
│   ├── app/                    # Redux store setup
│   │   ├── store.ts
│   │   └── rootReducer.ts
│   │
│   ├── features/               # Redux slices
│   │   ├── auth/authSlice.ts  # token, role, email, phone
│   │   └── property/propertySlice.ts  # Listing wizard state
│   │
│   ├── pages/                  # Route pages
│   │   ├── LandingPage/       # Home
│   │   ├── auth/              # Login, signup, OTP, reset
│   │   ├── ConfirmBooking.tsx # Payment flow
│   │   ├── PaymentSuccess.tsx # Post-payment
│   │   ├── SearchResults.tsx  # Search
│   │   ├── MyAccountPage.tsx  # User dashboard
│   │   └── listAparteFlow/   # 11-step listing wizard
│   │
│   ├── components/             # Reusable (~50 files)
│   │   ├── ProtectedRoute.tsx
│   │   ├── header/, footer/, hero/, search/, property/
│   │   └── account/           # Profile, bookings, transactions
│   │
│   ├── utils/
│   │   ├── secureStorage.ts   # AES token encryption
│   │   ├── url.ts             # API URL normalization
│   │   └── errorHandler.ts    # FastAPI error extraction
│   │
│   ├── context/UserBooking.tsx # Booking state (localStorage)
│   ├── App.tsx                 # React Router routes
│   ├── main.tsx                # Entry point
│   └── theme.ts                # MUI theme (primary: #028090)
│
├── Dockerfile                  # Node 18 → Nginx (port 8080)
├── cloudbuild.yaml             # GCP Cloud Build → Cloud Run
├── vite.config.ts              # Dev port 3000
└── package.json
```

---

## Core Architecture

### State Management
- **Redux Persist**: Auth slice (token, role, email, phone) persisted in localStorage
- **RTK Query**: 7 API slices for all backend communication
- **Property Slice**: Non-persisted wizard state for 11-step listing flow

### Token Security
- AES encryption via CryptoJS in sessionStorage
- `secureStorage.ts`: `saveToken()`, `getToken()`, `removeToken()`
- Auto-logout on 401 via `useHandleAuthError` hook

### Booking & Payment Flow
1. Search → Select unit → Create booking (PENDING)
2. ConfirmBooking: Profile validation + price breakdown (base * nights + caution_fee)
3. Payment: MONNIFY SDK or WALLET balance
4. Monnify: `POST /wallets/{id}/transactions` → SDK → update booking
5. PaymentSuccess: Verify transaction via API

### API Layer
All API calls via RTK Query slices in `src/api/`:
```typescript
export const propertiesApi = createApi({
  reducerPath: 'propertiesApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_API_URL }),
  endpoints: (builder) => ({
    getProperties: builder.query({ ... }),
    createProperty: builder.mutation({ ... }),
  })
})
```

---

## Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | No | Home page |
| `/login`, `/signup`, `/otp` | No | Auth |
| `/property-details/:id` | No | Property details |
| `/search-results` | No | Search results |
| `/confirm-booking` | Yes | Booking + payment |
| `/account` | Yes | User dashboard |
| `/list` | Yes | Property listing wizard |
| `/kycdetails` | Yes | KYC upload |

---

## Environment Variables

```
VITE_API_BASE_URL=https://api.aparteng.com/api/v1
VITE_TOKEN_SECRET_KEY={AES key}
VITE_GOOGLE_MAPS_API_KEY={Maps key}
VITE_ADMIN_DASHBOARD_URL=https://dashboard.aparteng.com
VITE_SENTRY_DSN={optional}
```

---

## Development & Deployment

```bash
npm run dev       # localhost:3000
npm run build     # tsc + vite build
```

- **Deploy:** GCP Cloud Run (europe-west1) via Cloud Build
- **Docker:** Node 18 builder → Nginx Alpine, port 8080
- **Resources:** 256Mi memory, 0.5 CPU

---

## Quick Reference for Gemini

- **API calls**: Use RTK Query slices in `src/api/`, never raw fetch
- **New page**: Add to `src/App.tsx` routes + `src/pages/`
- **Protected route**: Wrap with `<ProtectedRoute>`
- **Error handling**: `extractErrorMessage()` from `src/utils/errorHandler.ts`
- **Token**: `secureStorage.ts` (encrypt/decrypt), never raw sessionStorage
- **Forms**: `useValidator` hook
- **Styling**: Tailwind first, MUI for complex components
- **Theme**: MUI primary `#028090`, font `TT Firs Neue TRL`
- **URL config**: `BASE_API_URL` from `src/utils/url.ts`

---

## Critical Notes for Gemini

1. **Never hardcode API URLs** - Use `VITE_*` env vars, normalized in `url.ts`
2. **Token is AES-encrypted** - Use `secureStorage.ts`, not raw sessionStorage
3. **RTK Query for all API calls** - Never bypass with raw fetch/axios
4. **Auth state in Redux** - Only `token`, `role`, `email`, `phone` are persisted
5. **Booking state in context** - `UserBooking.tsx` uses localStorage (key: `aparte_last_booking`)
6. **Monnify SDK fallback** - Falls back to payment link if SDK not loaded
7. **Admin users redirected** - Admin/super_admin roles redirected to admin dashboard
8. **SPA routing** - Nginx handles all routes via `try_files` to `index.html`

---

**Last Updated:** March 2, 2026
**Agent Identification:** Antigravity (Gemini-powered)
**Version:** 1.0.0
