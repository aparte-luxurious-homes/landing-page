'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Design tokens for the property page. Local on purpose: the rest of the site
 * is white-and-teal, and this page is deliberately a different, warmer,
 * editorial surface — ink + paper + one sand accent — so the values live next
 * to the components that use them rather than in the global MUI theme.
 */
// Aparte's one green. Every green surface on this page is this exact value —
// no tints, no darker teal. Text is a neutral near-black (the site's title colour).
export const BRAND = '#028090';
export const TEAL = BRAND;
export const INK = '#191919';
export const PAPER = '#F3EFE7';
export const SAND = '#E8C27A';
// Fraunces is the site's display face (loaded in app/layout.tsx, weights 500/600).
export const SERIF = 'Fraunces, ui-serif, Georgia, serif';

/** Eyebrow + serif title. Every section opens with one so the page has a rhythm. */
export const SectionHeading: React.FC<{
  eyebrow: string;
  title: string;
  sub?: string;
  light?: boolean;
}> = ({ eyebrow, title, sub, light }) => (
  <Box sx={{ mb: { xs: 2.5, md: 3.5 } }}>
    <Typography
      sx={{
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: "white",
        mb: 0.75,
      }}
    >
      {eyebrow}
    </Typography>
    <Typography
      component="h2"
      sx={{
        fontFamily: SERIF,
        fontWeight: 600,
        fontSize: { xs: '1.875rem', md: '2.5rem' },
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        color: light ? '#fff' : INK,
        m: 0,
      }}
    >
      {title}
    </Typography>
    {sub && (
      <Typography
        sx={{ mt: 1, color: light ? 'rgba(255,255,255,0.7)' : 'rgba(25,25,25,0.65)', maxWidth: 560 }}
      >
        {sub}
      </Typography>
    )}
  </Box>
);
