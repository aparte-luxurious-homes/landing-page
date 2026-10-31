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
import { SAND, SERIF,BRAND } from './ui';

interface PropertyHeaderProps {
  name?: string;
  city?: string;
  state?: string;
  propertyType?: string;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
}

const Glass: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      px: 1.5,
      py: 0.6,
      borderRadius: 999,
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.6)',
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
}) => {
  const place = [city, state].filter(Boolean).join(', ');
  return (
    <Box sx={{ color: '#fff', maxWidth: { md: '62%' } }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
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
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: { xs: '2.25rem', sm: '3rem', md: '4rem' },
          lineHeight: 1.02,
          letterSpacing: '-0.025em',
          textWrap: 'balance',
          
        }}
      >
        {name}
      </Typography>

      <Box
        sx={{
          mt: 1.75,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: 2,
          rowGap: 0.5,
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.9)',
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
      </Box>
    </Box>
  );
};

export default PropertyHeader;
