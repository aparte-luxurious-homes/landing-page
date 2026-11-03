import React from 'react';
import { Box } from '@mui/material';
import {
  Home as HomeIcon,
  Pets as PetsIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import { propertyTypeLabel } from '@/lib/propertyTypes';

interface PropertyQuickInfoProps {
  propertyType: string | undefined;
  isPetAllowed: boolean | undefined;
  isPartyAllowed: boolean | undefined;
  /** Pets/parties only, icon-only on phones — for the sticky section bar. */
  compact?: boolean;
}

const Pill: React.FC<{ icon: React.ReactNode; muted?: boolean; compact?: boolean; children: string }> = ({
  icon,
  muted,
  compact,
  children,
}) => (
  <Box
    title={children}
    aria-label={children}
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      px: compact ? { xs: 1, md: 1.5 } : 1.5,
      py: 0.75,
      borderRadius: 999,
      fontSize: '0.8125rem',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      border: '1px solid',
      borderColor: 'rgba(25,25,25,0.12)',
      bgcolor: muted ? 'transparent' : '#fff',
      color: muted ? 'rgba(25,25,25,0.6)' : '#191919',
      '& svg': { fontSize: 16 },
    }}
  >
    {icon}
    {compact ? <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>{children}</Box> : children}
  </Box>
);

/**
 * House-policy pills. A single scrolling row on phones (bleeds to the screen
 * edge so it reads as swipeable) and a wrapped row on desktop.
 */
const PropertyQuickInfo: React.FC<PropertyQuickInfoProps> = ({
  propertyType,
  isPetAllowed,
  isPartyAllowed,
  compact,
}) => (
  <Box
    sx={{
      display: 'flex',
      gap: 1,
      flexWrap: { xs: 'nowrap', md: 'wrap' },
      ...(compact
        ? {}
        : { overflowX: { xs: 'auto', md: 'visible' }, mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 } }),
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }}
  >
    {propertyType && !compact && <Pill icon={<HomeIcon />}>{propertyTypeLabel(propertyType)}</Pill>}
    <Pill compact={compact} icon={<PetsIcon />} muted={!isPetAllowed}>
      {isPetAllowed ? 'Pets allowed' : 'No pets'}
    </Pill>
    <Pill compact={compact} icon={<CelebrationIcon />} muted={!isPartyAllowed}>
      {isPartyAllowed ? 'Parties allowed' : 'No parties'}
    </Pill>
  </Box>
);

export default PropertyQuickInfo;
