'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  Star as StarIcon,
  LocationOn as LocationOnIcon,
  Verified as VerifiedIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { propertyTypeLabel } from '@/lib/propertyTypes';
import { SAND, BRAND } from './ui';
import PropertyHostInfo, { PropertyHostInfoProps } from './PropertyHostInfo';

interface PropertyHeaderProps {
  name?: string;
  city?: string;
  state?: string;
  propertyType?: string;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  agent?: PropertyHostInfoProps['agent'];
}

const Glass: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      // Phones: plain small caps, no pill. Two outlined pills plus a title
      // plus a host pill buried the photo they sit on.
      px: { xs: 0, md: 1.5 },
      py: { xs: 0, md: 0.6 },
      borderRadius: 999,
      fontSize: { xs: '0.6875rem', md: '0.75rem' },
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#fff',
      border: { xs: 'none', md: '1px solid rgba(255,255,255,0.6)' },
    }}
  >
    {children}
  </Box>
);

/** The title as it appears over the hero photo — white type on the ink scrim. */
const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  name,
  city,
  state,
  propertyType,
  isVerified,
  rating,
  reviewCount = 0,
  agent,
}) => {
  const place = [city, state].filter(Boolean).join(', ');
  return (
    <Box sx={{ color: '#fff', maxWidth: { md: '62%' } }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: { xs: 1.5, md: 1 }, rowGap: 1, mb: { xs: 0.75, md: 1.5 } }}>
        {propertyType && (
          <Glass>
            <HomeIcon sx={{ fontSize: 14 }} />
            {propertyTypeLabel(propertyType)}
          </Glass>
        )}
        {isVerified && (
          <Glass>
            <VerifiedIcon sx={{ fontSize: 14, color: BRAND }} />
            Verified
          </Glass>
        )}
      </Box>

      <Typography
        component="h1"
        sx={{
          m: 0,
          fontWeight: 700,
          fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3.75rem' },
          lineHeight: 1.08,
          letterSpacing: '-0.025em',
          textWrap: 'balance',
          // A long name never pushes the title block up into the controls.
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: { xs: 2, md: 3 },
          overflow: 'hidden',
        }}
      >
        {name}
      </Typography>

      <Box
        sx={{
          mt: { xs: 1, md: 1.75 },
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: { xs: 1.5, md: 2 },
          rowGap: 0.5,
          fontSize: { xs: '0.875rem', md: '1rem' },
          color: 'rgba(255,255,255,0.9)',
          // index.css sets `* { font-size: 16px }`, so nothing inherits a
          // size: without this the place, rating and host stayed 16px on
          // phones and the host wrapped onto a line of its own. `:where()`
          // has no specificity, so it beats `*` and nothing else. Icons are
          // svg and keep their own sizes.
          '@media (max-width: 899.95px)': {
            '& :where(span, a, div)': { fontSize: 'inherit' },
          },
        }}
      >
        {place && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
            <LocationOnIcon sx={{ fontSize: 18 }} />
            {place}
          </Box>
        )}
        {reviewCount > 0 ? (
          <Box
            component="a"
            href="#reviews"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#fff', fontWeight: 700, textDecoration: 'none' }}
          >
            <StarIcon sx={{ fontSize: 18, color: SAND }} />
            {Number(rating ?? 0).toFixed(1)}
            <Box component="span" sx={{ fontWeight: 400, opacity: 0.8 }}>
              · {reviewCount} review{reviewCount === 1 ? '' : 's'}
            </Box>
          </Box>
        ) : null }
        <PropertyHostInfo agent={agent} variant="hero" />
      </Box>
    </Box>
  );
};

export default PropertyHeader;
