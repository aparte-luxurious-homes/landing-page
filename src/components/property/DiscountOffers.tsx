'use client';

import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';
import {
  discountLabel,
  discountScopeNote,
  summarizePolicy,
  type DiscountPolicy,
  type DiscountSummary,
} from '@/utils/discounts';

interface DiscountOffersProps {
  /**
   * The policies that will actually price what is being shown. For a unit that
   * means `effective_*_discount_policy`, NOT the property's own columns — a
   * unit can override the listing, and reading past the override is how a
   * guest gets promised a saving they will not receive.
   */
  longStay?: DiscountPolicy | null;
  extension?: DiscountPolicy | null;
  /**
   * Pre-resolved summaries, for callers that have `discount_summary` from the
   * API rather than raw policies. Takes precedence when given: it is the
   * server's answer, and re-deriving it from a subset of the units here would
   * be a second opinion on the same question.
   */
  longStaySummary?: DiscountSummary | null;
  extensionSummary?: DiscountSummary | null;
  size?: 'small' | 'medium';
  sx?: object;
}

/**
 * The offers on a listing or a unit, as chips.
 *
 * Deliberately does not state a total. Only the booking quote knows the dates,
 * the unit count and the owner's per-date overrides, so any figure computed
 * here would be a second, quieter answer to a question the quote already
 * answers — and the two would drift. These chips say an offer *exists* and
 * what unlocks it; the price breakdown says what it is worth.
 */
const DiscountOffers: React.FC<DiscountOffersProps> = ({
  longStay,
  extension,
  longStaySummary,
  extensionSummary,
  size = 'small',
  sx = {},
}) => {
  const long = longStaySummary ?? summarizePolicy(longStay);
  const ext = extensionSummary ?? summarizePolicy(extension);

  const longText = discountLabel(long, 'long_stay');
  const extText = discountLabel(ext, 'extension');
  if (!longText && !extText) return null;

  const note = discountScopeNote(long) ?? discountScopeNote(ext);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', ...sx }}>
      {longText && (
        <Chip
          size={size}
          icon={<LocalOfferOutlinedIcon />}
          label={longText}
          sx={{
            bgcolor: 'success.light',
            color: 'success.contrastText',
            fontWeight: 600,
            '& .MuiChip-icon': { color: 'inherit' },
          }}
        />
      )}
      {extText && (
        <Tooltip title="Applies to extra nights only — your original booking and caution fee are unchanged.">
          <Chip
            size={size}
            icon={<EventRepeatOutlinedIcon />}
            label={extText}
            variant="outlined"
            sx={{ fontWeight: 600, borderColor: 'success.main', color: 'success.main' }}
          />
        </Tooltip>
      )}
      {note && (
        <Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
          {note}
        </Box>
      )}
    </Box>
  );
};

export default DiscountOffers;
