import React from 'react';
import { Box, Chip, MenuItem, TextField, Typography } from '@mui/material';
import type { EventSlots } from '../../api/propertiesApi';
import { BILLING_UNIT_WORD, BillingUnit } from '../../utils/eventCentre';

/**
 * Everything the property page knows about the hire a guest is building.
 * Held by PropertyDetails and handed to both the desktop sidebar and the
 * mobile summary, so the two can never offer different things.
 */
export interface VenueHireState {
  offered: BillingUnit[];
  billingUnit: BillingUnit;
  setBillingUnit: (u: BillingUnit) => void;
  /** Days for a full-day hire, hours for an hourly one. */
  billingDuration: number;
  setBillingDuration: (n: number) => void;
  eventStartTime: string | null;
  setEventStartTime: (t: string | null) => void;
  halfDayWindow: string | null;
  setHalfDayWindow: (name: string | null) => void;
  /** Free times on the chosen date; undefined until a date is picked. */
  slots?: EventSlots;
  slotsLoading?: boolean;
  /** The hall's rate per one of the selected billing unit. */
  rate: number;
  /** Why the current choice can't be booked (from the quote), if it can't. */
  problem?: string | null;
}

const LABEL: Record<BillingUnit, string> = {
  PER_DAY: 'Full day',
  PER_HALF_DAY: 'Half-day session',
  PER_HOUR: 'By the hour',
};

const MAX_DAYS = 30;

export default function VenueHirePicker({
  hire,
  hasDate,
  formatPrice,
}: {
  hire: VenueHireState;
  hasDate: boolean;
  formatPrice: (n: number) => string;
}) {
  const {
    offered,
    billingUnit,
    setBillingUnit,
    billingDuration,
    setBillingDuration,
    eventStartTime,
    setEventStartTime,
    halfDayWindow,
    setHalfDayWindow,
    slots,
    slotsLoading,
    problem,
  } = hire;

  if (!offered.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
        This hall isn&apos;t taking bookings online yet.
      </Typography>
    );
  }

  const chosenStart = slots?.hourly_starts.find((s) => s.start === eventStartTime);

  return (
    <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <TextField
        select
        size="small"
        label="How do you want to hire it?"
        value={billingUnit}
        onChange={(e) => setBillingUnit(e.target.value as BillingUnit)}
        fullWidth
      >
        {offered.map((u) => (
          <MenuItem key={u} value={u}>
            {LABEL[u]}
          </MenuItem>
        ))}
      </TextField>

      {!hasDate ? (
        <Typography variant="caption" color="text.secondary">
          Pick your event date to see the free times.
        </Typography>
      ) : slotsLoading && !slots ? (
        <Typography variant="caption" color="text.secondary">
          Checking free times...
        </Typography>
      ) : billingUnit === 'PER_DAY' ? (
        <TextField
          type="number"
          size="small"
          label="Number of days"
          value={billingDuration}
          inputProps={{ min: 1, max: MAX_DAYS }}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!Number.isNaN(n)) setBillingDuration(Math.min(MAX_DAYS, Math.max(1, n)));
          }}
          helperText={
            slots && !slots.full_day_available
              ? 'Part of this day is already booked; try another date or a shorter hire.'
              : slots
                ? `Opening to closing, ${slots.opening_time}–${slots.closing_time}`
                : undefined
          }
          error={!!slots && !slots.full_day_available}
          fullWidth
        />
      ) : billingUnit === 'PER_HALF_DAY' ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {(slots?.half_day_windows ?? []).map((w) => (
            <Chip
              key={w.name}
              label={`${w.name} · ${w.start}–${w.end}${w.available ? '' : ' (taken)'}`}
              disabled={!w.available}
              color={halfDayWindow === w.name ? 'primary' : 'default'}
              variant={halfDayWindow === w.name ? 'filled' : 'outlined'}
              onClick={() => setHalfDayWindow(w.name)}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            select
            size="small"
            label="Start time"
            value={eventStartTime ?? ''}
            onChange={(e) => setEventStartTime(e.target.value || null)}
            sx={{ flex: 1 }}
            helperText={slots && slots.hourly_starts.length === 0 ? 'No free hours on this date' : undefined}
            error={!!slots && slots.hourly_starts.length === 0}
          >
            {(slots?.hourly_starts ?? []).map((s) => (
              <MenuItem key={s.start} value={s.start}>
                {s.start}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Hours"
            value={billingDuration}
            onChange={(e) => setBillingDuration(Number(e.target.value))}
            disabled={!chosenStart}
            sx={{ flex: 1 }}
          >
            {Array.from({ length: chosenStart?.max_hours ?? 1 }, (_, i) => i + 1).map((h) => (
              <MenuItem key={h} value={h}>
                {h} {h === 1 ? 'hour' : 'hours'}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {slots && slots.busy.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          Already booked on this day: {slots.busy.map((b) => `${b.start}–${b.end}`).join(', ')}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        {formatPrice(hire.rate)} per {BILLING_UNIT_WORD[billingUnit].one}
      </Typography>
      {problem && (
        <Typography variant="caption" color="error">
          {problem}
        </Typography>
      )}
    </Box>
  );
}
