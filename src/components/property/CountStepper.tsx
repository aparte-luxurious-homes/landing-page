'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { TYPE } from '@/lib/typography';
import { BRAND, INK } from './ui';

/**
 * One count on one line: label and hint on the left, − value + on the right.
 *
 * Replaces the number inputs the booking card and the mobile sheet used for
 * units, guests and pets. Those took a full bordered box each, and on phones
 * a 14px input made iOS zoom the whole page when the keyboard opened. A
 * stepper needs no keyboard at all, and the value can only move between
 * `min` and `max`, so there is nothing to clamp after the fact.
 */
export interface CountStepperProps {
  label: React.ReactNode;
  /** Short context under the label, e.g. "Up to 4" or "2 available". */
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  /** Noun for the buttons' accessible names: "Remove a guest" / "Add a guest". */
  noun: string;
  dense?: boolean;
}

const stepButton = (disabled: boolean) => ({
  all: 'unset' as const,
  boxSizing: 'border-box' as const,
  width: 40,
  height: 40,
  flex: 'none',
  borderRadius: '50%',
  border: '1px solid',
  borderColor: disabled ? 'rgba(25,25,25,0.12)' : 'rgba(25,25,25,0.28)',
  color: disabled ? 'rgba(25,25,25,0.3)' : INK,
  display: 'grid',
  placeItems: 'center',
  fontSize: TYPE.xl,
  lineHeight: 1,
  cursor: disabled ? 'not-allowed' : 'pointer',
  WebkitTapHighlightColor: 'transparent',
  '&:hover': disabled ? undefined : { borderColor: BRAND, color: BRAND },
  '&:focus-visible': { outline: `2px solid ${BRAND}`, outlineOffset: 2 },
});

const CountStepper: React.FC<CountStepperProps> = ({ label, hint, value, min, max, onChange, noun, dense }) => {
  const safe = Number.isFinite(value) ? value : min;
  const atMin = safe <= min;
  const atMax = safe >= max;
  return (
    <Box
      role="group"
      aria-label={typeof label === 'string' ? label : noun}
      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: dense ? 1 : 1.25 }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: TYPE.base, fontWeight: 600, lineHeight: 1.3, color: INK }}>{label}</Typography>
        {hint && (
          <Typography sx={{ fontSize: TYPE.xs, lineHeight: 1.4, color: 'rgba(25,25,25,0.6)' }}>{hint}</Typography>
        )}
      </Box>
      <Box
        component="button"
        type="button"
        aria-label={`Remove ${noun}`}
        disabled={atMin}
        onClick={() => !atMin && onChange(safe - 1)}
        sx={stepButton(atMin)}
      >
        −
      </Box>
      <Typography
        aria-live="polite"
        sx={{ minWidth: 24, textAlign: 'center', fontSize: TYPE.base, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: INK }}
      >
        {safe}
      </Typography>
      <Box
        component="button"
        type="button"
        aria-label={`Add ${noun}`}
        disabled={atMax}
        onClick={() => !atMax && onChange(safe + 1)}
        sx={stepButton(atMax)}
      >
        +
      </Box>
    </Box>
  );
};

export default CountStepper;
