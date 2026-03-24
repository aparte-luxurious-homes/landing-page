# Landing Page — Architecture Reference

> **Stack:** React 18.3.1 · TypeScript 5.6.2 · Vite 5.4.10 · Redux Toolkit 2.4.0 (RTK Query) · React Router v6.28.0 · Tailwind CSS 3.4.15 · Material-UI 6.1.7
> **Last Updated:** 2026-03-10

---

## Table of Contents
1. [Directory Structure](#directory-structure)
2. [Routing (React Router v6)](#routing-react-router-v6)
3. [State Management](#state-management)
4. [API Layer (RTK Query)](#api-layer-rtk-query)
5. [Authentication Flow](#authentication-flow)
6. [Booking Context](#booking-context)
7. [Payment Integration](#payment-integration)
8. [Component Architecture](#component-architecture)
9. [Configuration](#configuration)

---

## Directory Structure

```
landing-page/src/
├── api/                      # RTK Query API slices (one per domain)
│   ├── authApi.ts            # signup, login, verifyOtp, passwordReset
│   ├── propertiesApi.ts      # getProperties, getPropertyById, availability
│   ├── booking.ts            # createBooking, updateBookingStatus
│   ├── bookingsApi.ts        # user bookings list
│   ├── paymentApi.ts         # postPayment, verifyTransaction, getGatewayConfig
│   ├── profileApi.ts         # getProfile, updateProfile, verifyIdentity
│   ├── transactionsApi.ts    # transaction history
│   ├── walletsApi.ts         # wallet balance + operations
│   └── listApi.ts            # property listing creation
│
├── app/
│   ├── store.ts              # Redux store (auth + all RTK Query reducers)
│   └── rootReducer.ts
│
├── components/               # Reusable UI components organized by feature
│   ├── account/              # Account dashboard sub-components
│   ├── booking/              # ConfirmBooking, PaymentMethod, Success views
│   ├── header/               # Navbar, ActionButtons, AccountDropdown
│   ├── search/               # SearchBar, Filters, DateInput, GuestsInput
│   ├── property/             # PropertyCard, UnitDetails, BookingSidebar
│   ├── forms/                # InputGroup, SelectGroup, EmailForm
│   ├── skeletons/            # Loading skeleton components
│   ├── ProtectedRoute.tsx    # Route guard for /list
│   └── ScrollToTop.tsx       # Auto-scroll on route change
│
├── context/
│   └── UserBooking.tsx       # Booking context (localStorage, 30min expiry)
│
├── features/
│   ├── auth/
│   │   └── authSlice.ts      # Redux: { token, isAuthenticated, userRole, email, phone }
│   └── property/
│       └── propertySlice.ts  # (property listing creation state)
│
├── hooks/
│   ├── useAuth.ts            # Auth state helpers
│   └── useHandleAuthError.ts # RTK Query error → re-login
│
├── pages/                    # Page-level components (route targets)
│   ├── auth/                 # AuthPage, LoginPage, SignUpPage, OTPVerification, etc.
│   ├── LandingPage/          # HomePage
│   ├── PropertyDetails.tsx   # Full property + booking sidebar
│   ├── SearchResults.tsx     # Filtered listings
│   ├── ConfirmBooking.tsx    # Booking checkout + payment
│   ├── PaymentSuccess.tsx    # Payment confirmation (/booking-validation)
│   ├── MyAccountPage.tsx     # Profile, bookings, transactions, wallet
│   ├── ListApartePage.tsx    # Property creation (owner/agent flow)
│   ├── AddAmenitiesMedia.tsx # Step 2 of property creation
│   └── kycDetails.tsx        # KYC document upload
│
├── redux/
│   ├── amenitiesSlice.ts     # Amenities selection (listing flow)
│   ├── guestSlice.ts         # Guest count state
│   └── unitsPricingSlice.ts  # Unit pricing (listing flow)
│
├── sections/
│   ├── Header.tsx            # Persistent top navigation
│   ├── Footer.tsx            # Persistent footer
│   ├── Hero.tsx              # Home page hero section
│   └── Apartments.tsx        # Featured listings section
│
├── types/
│   ├── booking.ts            # BookingDetails interface
│   ├── index.ts              # IPropertyRequest
│   └── search.ts             # SearchFilters interface
│
├── utils/
│   ├── bookings.ts           # isValidBooking, loadBookingFromStorage
│   ├── secureStorage.ts      # Encrypted token storage
│   ├── url.ts                # BASE_API_URL
│   └── errorHandler.ts       # extractErrorMessage utility
│
├── constant/
│   └── booking.ts            # STORAGE_KEYS, BOOKING_EXPIRY_MS (30min)
│
├── theme.ts                  # MUI theme override
├── App.tsx                   # Route definitions (React Router v6)
├── main.tsx                  # Entry point
└── sentry.ts                 # Sentry initialization
```

---

## Routing (React Router v6)

All routes defined in `src/App.tsx`:

| Path | Component | Auth |
|------|-----------|------|
| `/` | `HomePage` | No |
| `/login` | `LoginPage` | No |
| `/signup` | `SignUpPage` | No |
| `/otp` | `OTPVerification` | No |
| `/property-details/:id` | `PropertyDetails` | No |
| `/search-results` | `SearchResults` | No |
| `/confirm-booking` | `ConfirmBooking` | Yes (soft: redirect to login) |
| `/booking-validation` | `PaymentSuccess` | Yes |
| `/account` | `MyAccountPage` | Yes |
| `/list` | `ListApartePage` | Yes (ProtectedRoute) |
| `/add-amenities-media` | `AddAmenitiesMedia` | Yes |
| `/kycdetails` | `KycDetails` | Yes |
| `/auth/request-reset` | `RequestPasswordReset` | No |
| `/auth/reset-password` | `ResetPassword` | No |
| `/about` | `AboutUs` | No |

**ProtectedRoute** (`components/ProtectedRoute.tsx`):
- Checks `auth.isAuthenticated && auth.token`
- If not authenticated: shows login modal, stores `?redirect=/original-path`

---

## State Management

### Dual-layer architecture

```
Redux (global, persisted)             RTK Query (server state)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━━━━━━━━━━━━━
auth: { token, isAuthenticated,        authApi: login/signup cache
        userRole, email, phone }        propertiesApi: property lists
amenities: [...selected]               bookingApi: booking state
guestSlice: { adults, children, pets } paymentApi: payment cache
unitsPricingSlice: { units, pricing }  profileApi: user profile
                                        walletsApi: wallet state
Persisted: auth.email, auth.phone      Not persisted (server source of truth)
(via redux-persist + secureStorage)
```

### Auth Redux State

```typescript
interface AuthState {
  token: string | null;           // JWT, stored encrypted via secureStorage
  isAuthenticated: boolean;
  userRole: string | null;        // UserRole enum value
  email: string | null;           // Persisted across sessions
  phone: string | null;           // Persisted across sessions
}
```

---

## API Layer (RTK Query)

### Configuration

Base URL from `src/utils/url.ts`:
```typescript
export const BASE_API_URL = import.meta.env.VITE_API_URL ?? "https://api.aparteng.com/api/v1";
```

All API slices use `fetchBaseQuery` with:
- `baseUrl: BASE_API_URL`
- `prepareHeaders`: injects `Authorization: Bearer {token}` from Redux auth state

### API Modules

```typescript
// src/api/authApi.ts
useSignupMutation()      → POST /auth/signup
useLoginMutation()       → POST /auth/login
useVerifyOtpMutation()   → POST /auth/otp/verify
useRequestPasswordResetMutation()
useResetPasswordMutation()

// src/api/propertiesApi.ts
useGetPropertiesQuery(filters)   → GET /properties
useGetPropertyByIdQuery(id)      → GET /properties/{id}
useLazyGetPropertiesQuery()      → Deferred search trigger
useGetUnitAvailabilityQuery(...)

// src/api/paymentApi.ts
usePostPaymentMutation()         → POST /transactions
useVerifyTransactionMutation()   → POST /transactions/verify
useGetGatewayConfigQuery()       → GET /integrations/config
useGetDefaultGatewayConfigQuery()

// src/api/profileApi.ts
useGetProfileQuery()             → GET /profile
useUpdateProfileMutation()       → PUT /profile (multipart FormData)
useVerifyIdentityMutation()      → POST /profile/verify-identity
```

### Error Handling

```typescript
// Utility: src/utils/errorHandler.ts
export function extractErrorMessage(error: unknown): string {
  if (error?.data?.message) return error.data.message;
  if (error?.data?.detail) return error.data.detail;
  return "An error occurred. Please try again.";
}

// Usage in components:
const { error } = useSignupMutation();
if (error) toast.error(extractErrorMessage(error));
```

---

## Authentication Flow

### Guest Registration

```
/signup → AuthPage (mode="signup")
    │
    ├─ Step 1: EmailForm (email, password, role=GUEST)
    │          POST /auth/signup
    │          → Response: { message, data: { email, verificationToken } }
    │
    ├─ Step 2: OTPVerification
    │          POST /auth/otp/verify
    │          → Response: { data: { user, authorization: { token } } }
    │          → dispatch setToken(token)
    │          → dispatch setUserRole(user.role)
    │
    └─ Step 3: GuestProfileForm (firstName, lastName, dob, phone)
               PUT /profile (FormData)
               → navigate to "/" or ?redirect URL
```

### Token Storage

```typescript
// src/utils/secureStorage.ts
// Encrypts token before writing to localStorage
export const secureStorage = {
  setItem: (key, value) => localStorage.setItem(key, encrypt(value)),
  getItem: (key) => decrypt(localStorage.getItem(key)),
  removeItem: (key) => localStorage.removeItem(key),
};
```

Token encrypted in localStorage, loaded into Redux on app init.

---

## Booking Context

`src/context/UserBooking.tsx` manages transient booking state between pages.

### Why a Context (not Redux)?

The booking details (unit, dates, guests, pricing) are only valid for 30 minutes and should not persist across days. Using a Context with localStorage expiry is more appropriate than persisting to Redux.

### Interface

```typescript
interface BookingDetails {
  id: string;              // property_id
  title: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  pets: number;
  nights: number;
  base_price: number;
  caution_fee: number;
  total_charging_fee: number;   // base_price * nights + caution_fee
  unit_image: string;
  unit_count: number;
  unit_id: string;
  owner?: { ... };
}
```

### Expiry Mechanism

```typescript
const BOOKING_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// On set:
localStorage.setItem(STORAGE_KEYS.BOOKING, JSON.stringify({
  data: booking,
  expiresAt: Date.now() + BOOKING_EXPIRY_MS
}));

// On get:
const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKING));
if (stored?.expiresAt < Date.now()) {
  localStorage.removeItem(STORAGE_KEYS.BOOKING);
  return null;
}
```

---

## Payment Integration

The landing page integrates two payment SDKs loaded via CDN:

### Monnify

```typescript
// Initialize payment:
window.MonnifySDK.initialize({
  amount: totalAmount,
  currency: "NGN",
  reference: transactionRef,
  customerFullName: `${user.firstName} ${user.lastName}`,
  customerEmail: user.email,
  apiKey: gatewayConfig.apiKey,
  contractCode: gatewayConfig.contractCode,
  paymentDescription: `Booking ${bookingId}`,
  onComplete: (response) => {
    // response.paymentStatus === "PAID"
    // Navigate to /booking-validation
  },
  onClose: () => { /* Handle abandoned payment */ }
});
```

### Paystack

```typescript
// Initialize payment:
const handler = window.PaystackPop.setup({
  key: gatewayConfig.publicKey,
  email: user.email,
  amount: totalAmount * 100,  // Paystack expects kobo
  ref: transactionRef,
  callback: (response) => {
    // response.status === "success"
    // Navigate to /booking-validation
  },
  onClose: () => { /* Handle abandoned payment */ }
});
handler.openIframe();
```

### Payment Flow

```
1. POST /transactions → creates transaction + returns transactionRef
2. Frontend initializes gateway SDK with transactionRef
3. Guest pays on gateway UI
4. Gateway webhook → api-v1 → updates booking to CONFIRMED
5. Guest redirected to /booking-validation
6. Frontend: GET /bookings/{id} → show confirmation
```

---

## Component Architecture

### Layout

```
App
├── ScrollToTop (hook: auto-scroll on route change)
├── BookingProvider (30-min booking context)
│   └── Router
│       ├── Header (persistent, role-aware)
│       │   ├── Logo
│       │   ├── Navigation
│       │   └── ActionButtons / AccountDropdown
│       │
│       ├── Route Pages
│       │   ├── HomePage
│       │   │   ├── Hero (LargeSearchBar)
│       │   │   ├── FeaturedProperties
│       │   │   ├── PropertyTypes
│       │   │   └── Partner section
│       │   │
│       │   ├── PropertyDetails
│       │   │   ├── ImageGallery
│       │   │   ├── PropertyHostInfo
│       │   │   ├── UnitDetailsList
│       │   │   ├── GoogleMap
│       │   │   └── BookingSidebar (desktop) / MobileBookingSummary (mobile)
│       │   │
│       │   └── ConfirmBooking
│       │       ├── StaySummary
│       │       ├── PaymentMethodSelection
│       │       └── PriceBreakdown
│       │
│       └── Footer (persistent)
```

### Search Components

| Component | File | Purpose |
|-----------|------|---------|
| `LargeSearchBar` | `components/search/` | Desktop hero search |
| `MobileSearchBar` | `components/search/` | Mobile optimized search |
| `FilterContent` | `components/search/` | Property type, bedroom count, price range filters |
| `DateInput` | `components/inputs/` | Date range picker |
| `GuestsInput` | `components/inputs/` | Adults/children/pets counter |

---

## Configuration

**Environment variables** (`.env`):

```bash
VITE_GOOGLE_MAPS_API_KEY=AIza...
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
VITE_API_URL=http://localhost:8000/api/v1
```

**vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: { port: 5173 },
});
```

**Development:**
```bash
cd landing-page
npm install
cp .env.example .env  # or create .env with required vars
npm run dev  # http://localhost:5173
```
