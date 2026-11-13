# Landing Page — Booking Flow Guide

End-to-end documentation of the guest booking experience, from search to payment confirmation.

---

## Overview

The booking flow has 3 phases, spanning 4+ pages:

```
Phase 1: Discovery          Phase 2: Selection        Phase 3: Payment
━━━━━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━
HomePage                    PropertyDetails            ConfirmBooking
SearchResults          ──►  (BookingSidebar)      ──►  PaymentSuccess
                            /booking-validation
```

---

## Phase 1: Search & Discovery

### Homepage Search

- `Hero` section renders `LargeSearchBar` (desktop) or `MobileSearchBar` (mobile)
- User enters: **location**, **check-in/check-out dates**, **guests count**
- On submit: navigate to `/search-results` with filters in `location.state`

### Search Results (`/search-results`)

- `SearchResults` triggers `useLazyGetPropertiesQuery()` on mount
- Applied filters:
  - `location`, `check_in`, `check_out`, `guests_count`
  - `property_type`, `min_price`, `max_price`, `bedroom_count`
  - `amenities[]`, `is_pet_allowed`, `required_units`
- Results rendered in `ResultsGrid` → `PropertyCard` components
- Pagination via `CustomPagination` component
- Sort options: newest, price-low-to-high, price-high-to-low

---

## Phase 2: Property Details & Date Selection

### Property Details Page (`/property-details/:id`)

**Data loaded:**
```typescript
const { data: property } = useGetPropertyByIdQuery(propertyId);
// Includes: property info, all units, amenities, owner details
```

**Layout:**
- Image gallery (swiper carousel)
- Property description + amenities grid
- `GoogleMap` component with property location pin
- Unit list: `UnitDetailsList` — each unit shows rooms, capacity, price
- Sticky sidebar: `BookingSidebar` (desktop) / `MobileBookingSummary` (mobile)

**User Selects:**
1. Unit (from unit list)
2. Check-in / Check-out dates
3. Guest count (adults, children, pets)
4. Number of units (if multi-unit property)

**Price Calculation (client-side):**
```typescript
// Fetch availability for date range:
useGetUnitAvailabilityQuery({ propertyId, unitId, startDate, endDate });

// Calculate:
const total = selectedDates.reduce((sum, date) => {
  const dayPrice = availability[date]?.pricing ?? unit.price_per_night;
  return sum + (dayPrice * unitCount);
}, 0);

const totalCharge = total + (unit.caution_fee * unitCount);
```

**On "Confirm Booking" click:**
1. Check if user is authenticated:
   - If not: show login dialog with `?redirect=/confirm-booking`
2. Check profile completeness (firstName, lastName, dob required)
3. Save `BookingDetails` to context + localStorage (30-minute expiry)
4. Navigate to `/confirm-booking`

---

## Phase 3: Payment

### Confirm Booking Page (`/confirm-booking`)

#### Step A: Profile Validation

```typescript
const { data: profile } = useGetProfileQuery();

const isProfileComplete =
  profile?.firstName && profile?.lastName && profile?.dob && profile?.phone;

if (!isProfileComplete) {
  setShowQuickProfileModal(true);  // Modal to complete profile
}
```

If profile incomplete: `QuickProfileComplete` modal appears before payment options.

#### Step B: Payment Method Selection

`PaymentMethodSelection` component offers:
1. **Pay Online** → sub-options: Monnify or Paystack
2. **Pay with Wallet** → shows wallet balance

#### Step C: Create Booking

```typescript
// On payment method confirmed:
const booking = await createBookingMutation.mutateAsync({
  unit_id: bookingContext.unit_id,
  start_date: bookingContext.check_in_date,
  end_date: bookingContext.check_out_date,
  guests_count: bookingContext.adults + bookingContext.children,
  unit_count: bookingContext.unit_count,
  referral_code: appliedReferralCode,  // optional
});
// Response: { id (UUID), booking_id (APRT_BK_...), status }
```

#### Step D: Request-to-Book Detection

```typescript
if (booking.status === "APPROVAL_PENDING") {
  // Show "Request Submitted" screen — no payment yet
  // User waits for owner approval
  // Navigate to /account to monitor status
  return;
}
// If PENDING: proceed to payment
```

#### Step E: Create Payment Transaction

```typescript
const payment = await postPaymentMutation.mutateAsync({
  walletId: user.wallets[0].id,
  userId: user.id,
  action: "DEBIT",
  amount: bookingContext.total_charging_fee,
  currency: "NGN",
  description: `Booking ${booking.booking_id}`,
  type: "PAYMENT",
  email: user.email,
  provider: selectedProvider,  // "MONNIFY" | "PAYSTACK"
  booking_id: booking.id,
  redirect_url: `${window.location.origin}/booking-validation`,
});
// Returns: { transactionRef, transactionId, checkoutUrl? }
```

#### Step F: Update Booking with Transaction

```typescript
await updateBookingStatusMutation.mutateAsync({
  bookingId: booking.id,
  transaction_id: payment.transactionId,
  transaction_ref: payment.transactionRef,
  transaction_status: "PENDING",
});
```

#### Step G: Initialize Payment Gateway

**Monnify:**
```typescript
window.MonnifySDK.initialize({
  amount: totalAmount,
  currency: "NGN",
  reference: payment.transactionRef,
  apiKey: gatewayConfig.apiKey,
  contractCode: gatewayConfig.contractCode,
  onComplete: (response) => {
    navigate("/booking-validation", { state: { bookingId: booking.id } });
  },
});
```

**Paystack:**
```typescript
const handler = window.PaystackPop.setup({
  key: gatewayConfig.publicKey,
  email: user.email,
  amount: totalAmount * 100,
  ref: payment.transactionRef,
  callback: () => {
    navigate("/booking-validation", { state: { bookingId: booking.id } });
  },
});
handler.openIframe();
```

**Wallet Payment:**
```typescript
// payment.status from RTK Query response
if (payment.status === "SUCCESSFUL") {
  // Booking already CONFIRMED
  navigate("/booking-validation", { state: { bookingId: booking.id } });
}
```

---

## Payment Confirmation (`/booking-validation`)

This page (`PaymentSuccess.tsx`) is the redirect target after all payment methods.

```typescript
// Load booking details
const { data: booking } = useGetBookingQuery(bookingId);

// Show:
// - Booking reference (APRT_BK_YYYYMMDD_XXXXX)
// - Property name, unit, check-in/out dates
// - Total paid
// - Actions: View Bookings → /account, Continue Browsing → /
```

Backend webhook has already updated the booking to `CONFIRMED` by the time the guest lands here.

---

## Error States & Edge Cases

| Scenario | Handling |
|----------|---------|
| Selected dates no longer available | Booking creation returns 400; show "Dates no longer available" toast |
| Payment gateway error | `onClose` callback — show retry option, booking stays PENDING |
| Profile incomplete | `QuickProfileComplete` modal gates payment entry |
| Booking context expired (>30 min) | Redirect to `/property-details/{id}` to reselect |
| Wallet insufficient balance | Payment API returns 400; show wallet balance + suggest online payment |
| Request-to-book property | Show "Awaiting Owner Approval" screen (no payment) |
| Guest not authenticated | Login redirect with `?redirect=/confirm-booking` |

---

## Owner Property Listing Flow

Owners/Agents create properties via a multi-step flow:

```
/auth/user-type → Select role (OWNER/AGENT)
      │
      ▼
/list (ProtectedRoute) → ListApartePage
      │ Step 1: Basic info (name, type, address, description, max_guests)
      │ Step 2: Room counts (bedrooms, bathrooms, living rooms, kitchens)
      │ Step 3: Pricing (price_per_night, caution_fee, unit_count)
      │ Step 4: Booking mode (INSTANT / REQUEST_TO_BOOK)
      │
      ▼
/add-amenities-media → AddAmenitiesMedia
      │ Step 5: Amenity selection (from GET /properties/amenities)
      │ Step 6: Media upload (images, videos — multiple files)
      │
      ▼
POST /properties → Created (status: PENDING verification by admin)
```

---

## KYC Flow (`/kycdetails`)

```
/kycdetails → KycDetails page
    │
    ├─ Show current KYC status (PENDING / VERIFIED / REJECTED)
    ├─ Allow document upload:
    │   POST /users/kyc → { document_type, file (to Cloudinary) }
    │
    └─ BVN/NIN verification (optional):
        POST /profile/verify-identity → { id_number, id_type }
        → Monnify/Paystack government ID check
```
