import React from 'react';
import { Box } from '@mui/material';
import {
  Home as HomeIcon,
  Pets as PetsIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import { propertyTypeLabel } from '@/lib/propertyTypes';
import { TYPE } from '@/lib/typography';

/** Decorative: the pill's text already says it, so screen readers skip it. */
const Emoji: React.FC<{ char: string }> = ({ char }) => (
  <span className="emoji" aria-hidden="true">{char}</span>
);

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
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: compact ? { xs: 0.4, md: 0.75 } : 0.75,
      px: 1.5,
      py: compact ? { xs: 0.5, md: 0.75 } : 0.75,
      borderRadius: 999,
      fontSize: compact ? { xs: TYPE.xs, md: TYPE.sm } : TYPE.sm,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      border: '1px solid',
      borderColor: 'rgba(25,25,25,0.12)',
      bgcolor: muted ? 'transparent' : '#fff',
      color: muted ? 'rgba(25,25,25,0.6)' : '#191919',
      '& svg': { fontSize: compact ? { xs: 14, md: 16 } : 16 },
      // Colour emoji for what a property allows; they carry their own colour.
      '& .emoji': { fontSize: compact ? { xs: 14, md: 16 } : 16, lineHeight: 1 },
    }}
  >
    {icon}
    {children}
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
      flexDirection: compact ? { xs: 'row', md: 'row' } : 'row',
      alignItems: compact ? { xs: 'flex-end', md: 'stretch' } : undefined,
      gap: compact ? { xs: 0.5, md: 1 } : 1,
      flexWrap: { xs: 'nowrap', md: 'wrap' },
      ...(compact
        ? {}
        : { overflowX: { xs: 'auto', md: 'visible' }, mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 } }),
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }}
  >
    {propertyType && !compact && <Pill icon={<HomeIcon />}>{propertyTypeLabel(propertyType)}</Pill>}
    {/* Allowed: a colour emoji so it reads as a yes at a glance. Not allowed:
        the muted outline icon, so the two states never look alike. */}
    <Pill compact={compact} icon={isPetAllowed ? <Emoji char="🐶" /> : <PetsIcon />} muted={!isPetAllowed}>
      {isPetAllowed ? 'Pets allowed' : 'No pets'}
    </Pill>
    <Pill compact={compact} icon={isPartyAllowed ? <Emoji char="🎉" /> : <CelebrationIcon />} muted={!isPartyAllowed}>
      {isPartyAllowed ? 'Parties allowed' : 'No parties'}
    </Pill>
  </Box>
);

export default PropertyQuickInfo;
