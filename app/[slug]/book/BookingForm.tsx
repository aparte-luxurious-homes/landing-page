"use client";

/** Guest checkout form (spec §3.2 steps 4-8).
 *
 * No account required: dates + guest details → POST the public booking
 * endpoint → redirect to the gateway checkout URL. REQUEST_TO_BOOK
 * properties get a "request received" state instead of a payment redirect.
 * Attribution + first-touch referral code come from sessionStorage
 * (lib/attribution.ts).
 */

import { useMemo, useState } from "react";

import { createPublicBooking, formatNaira } from "@/lib/links/api";
import { getAttribution } from "@/lib/links/attribution";
import type { CheckoutResult, PublicProperty } from "@/lib/links/types";

const NIGHT_MS = 24 * 60 * 60 * 1000;

function todayPlus(days: number): string {
  return new Date(Date.now() + days * NIGHT_MS).toISOString().slice(0, 10);
}

export default function BookingForm({ property }: { property: PublicProperty }) {
  const units = property.units;
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [startDate, setStartDate] = useState(todayPlus(1));
  const [endDate, setEndDate] = useState(todayPlus(3));
  const [guests, setGuests] = useState(2);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestResult, setRequestResult] = useState<CheckoutResult | null>(null);

  const unit = units.find((u) => u.id === unitId);

  const nights = useMemo(() => {
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return diff > 0 ? Math.round(diff / NIGHT_MS) : 0;
  }, [startDate, endDate]);

  const subtotal = unit && nights > 0 ? unit.price_per_night * nights : 0;
  const caution = unit?.caution_fee ?? 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!unit) return setError("Choose a unit.");
    if (nights < 1) return setError("Check-out must be after check-in.");
    if (!email && !phone) return setError("Enter an email or phone number.");

    setSubmitting(true);
    try {
      const attribution = getAttribution();
      const result = await createPublicBooking(property.slug, {
        unit_id: unit.id,
        start_date: startDate,
        end_date: endDate,
        guests_count: guests,
        unit_count: 1,
        guest: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        },
        referral_code: attribution.ref || undefined,
        attribution: {
          referrer_source: attribution.referrer_source,
          utm_source: attribution.utm_source,
          utm_medium: attribution.utm_medium,
          utm_campaign: attribution.utm_campaign,
          short_link_code: attribution.short_link_code,
        },
      });

      if (result.payment.payment_link) {
        // Hand off to the gateway-hosted checkout.
        window.location.assign(result.payment.payment_link);
        return;
      }
      // REQUEST_TO_BOOK (or gateway hiccup) — show the confirmation state.
      setRequestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (requestResult) {
    const isApproval = requestResult.status === "APPROVAL_PENDING";
    return (
      <div className="mt-8 rounded-2xl border border-brand/30 bg-brand/5 p-6">
        <h2 className="text-lg font-semibold text-brand">
          {isApproval ? "Request received 🎉" : "Booking created"}
        </h2>
        <p className="mt-2 text-sm text-neutral-700">
          {isApproval ? (
            <>
              Your booking request <strong>{requestResult.booking_id}</strong>{" "}
              has been sent to the host. You&apos;ll get an email
              {phone ? " and SMS" : ""} with a payment link as soon as they
              approve — usually within 24 hours.
            </>
          ) : (
            <>
              Booking <strong>{requestResult.booking_id}</strong> was created,
              but the payment page could not be opened automatically. Check
              your email for a payment link, or try again shortly.
            </>
          )}
        </p>
        {requestResult.guest.was_auto_created && email && (
          <p className="mt-3 text-xs text-neutral-500">
            We created an Aparte account for {email} — after payment you&apos;ll
            receive a link to set a password and manage your bookings.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {units.length > 1 && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Unit</span>
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2.5"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ?? "Unit"} — {formatNaira(u.price_per_night)}/night
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Check-in</span>
          <input
            type="date"
            required
            min={todayPlus(0)}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2.5"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Check-out</span>
          <input
            type="date"
            required
            min={startDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2.5"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Guests</span>
        <input
          type="number"
          min={1}
          max={unit?.max_guests ?? 20}
          required
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value || "1", 10))}
          className="w-32 rounded-xl border border-neutral-300 px-3 py-2.5"
        />
        {unit && (
          <span className="ml-2 text-xs text-neutral-500">
            max {unit.max_guests}
          </span>
        )}
      </label>

      <fieldset className="space-y-3 rounded-2xl border border-neutral-200 p-4">
        <legend className="px-1 text-sm font-semibold">Your details</legend>
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="rounded-xl border border-neutral-300 px-3 py-2.5"
          />
          <input
            required
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="rounded-xl border border-neutral-300 px-3 py-2.5"
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2.5"
        />
        <input
          type="tel"
          placeholder="Phone (+234…)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2.5"
        />
        <p className="text-xs text-neutral-500">
          No account needed — your booking confirmation goes to your email or
          phone.
        </p>
      </fieldset>

      {unit && nights > 0 && (
        <div className="space-y-1 rounded-2xl bg-neutral-50 p-4 text-sm">
          <div className="flex justify-between">
            <span>
              {formatNaira(unit.price_per_night)} × {nights} night
              {nights === 1 ? "" : "s"}
            </span>
            <span>{formatNaira(subtotal)}</span>
          </div>
          {caution > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>Refundable caution fee</span>
              <span>{formatNaira(caution)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold">
            <span>Total</span>
            <span>{formatNaira(subtotal + caution)}</span>
          </div>
          <p className="pt-1 text-xs text-neutral-500">
            A small card-processing fee may be added at payment.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-brand px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting
          ? "Creating your booking…"
          : property.booking_mode === "REQUEST_TO_BOOK"
            ? "Send booking request"
            : "Book now"}
      </button>

      <p className="text-center text-xs text-neutral-400">
        Payments are processed securely by Aparte via Paystack/Monnify.
      </p>
    </form>
  );
}
