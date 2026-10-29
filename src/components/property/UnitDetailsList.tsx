'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { BRAND, INK, TEAL, SAND, SERIF, SectionHeading } from './ui';
import {
  Check as CheckIcon,
  LocalOfferOutlined as OfferIcon,
} from '@mui/icons-material';
import { amenityIconFor, isPublishableAmenity } from '@/lib/amenityIcons';
import DiscountOffers from './DiscountOffers';
import { summarizePolicy, type DiscountPolicy } from '@/utils/discounts';

interface Unit {
  id: string;
  name: string;
  description: string;
  bedroom_count: number;
  bathroom_count: number;
  kitchen_count: number;
  living_room_count: number;
  max_guests: number;
  count: number;
  price_per_night: string;
  caution_fee: string;
  /* Flat {id, name} — the FastAPI serializer has returned this shape since the
     rewrite (services/properties/serializers.py). */
  amenities: { id: string; name: string }[];
  availability: string[];
  is_verified: boolean;
  is_whole_property: boolean;
  media: { fileUrl: string }[];
  seating_capacity?: number;
  standing_capacity?: number;
  car_park_spaces?: number;
  power_supply_provision?: string;
  /* The policy that will price THIS unit — the unit's own override where it has
     one, otherwise the property's, resolved server-side. The raw
     `*_discount_policy` fields hold only the override, so reading those would
     hide every inherited offer. */
  effective_long_stay_discount_policy?: DiscountPolicy | null;
  effective_extension_discount_policy?: DiscountPolicy | null;
  meta: { total_reviews: number; average_rating: number };
  property_id: string;
  createdAt: string;
  updatedAt: string;
}

interface UnitDetailsListProps {
  units: Unit[] | undefined;
  activeTab: string;
  onTabChange: (newValue: string) => void;
  showFullDescription: boolean;
  setShowFullDescription: (show: boolean) => void;
  showAllAmenities: boolean;
  setShowAllAmenities: (show: boolean) => void;
  displayCount: number;
  propertyType?: string;
  /** Used for a unit's thumbnail when the unit has no photos of its own. */
  fallbackImage?: string;
  formatPrice: (price: number) => string;
}

const hasOffer = (unit: Unit): boolean =>
  Boolean(
    summarizePolicy(unit.effective_long_stay_discount_policy) ||
    summarizePolicy(unit.effective_extension_discount_policy)
  );

const mediaUrl = (m?: any): string =>
  m?.media_url || m?.mediaUrl || m?.fileUrl || '';

/** "2 bed · 2 bath · 4 guests" — the line a guest actually compares units by. */
const specLine = (u: Unit, isVenue: boolean): string => {
  const parts: string[] = [];
  if (isVenue) {
    if (u.seating_capacity) parts.push(`Seats ${u.seating_capacity}`);
    if (u.standing_capacity) parts.push(`Stands ${u.standing_capacity}`);
    if (!parts.length && u.max_guests) parts.push(`${u.max_guests} guests`);
  } else {
    if (u.bedroom_count > 0) parts.push(`${u.bedroom_count} bed`);
    if (u.bathroom_count > 0) parts.push(`${u.bathroom_count} bath`);
    if (u.max_guests > 0)
      parts.push(`${u.max_guests} guest${u.max_guests === 1 ? '' : 's'}`);
  }
  return parts.join(' · ');
};

const UnitCard: React.FC<{
  unit: Unit;
  selected: boolean;
  thumb: string;
  isVenue: boolean;
  formatPrice: (n: number) => string;
  onSelect: () => void;
}> = ({ unit, selected, thumb, isVenue, formatPrice, onSelect }) => {
  const specs = specLine(unit, isVenue);
  return (
    <Box
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e: React.KeyboardEvent) =>
        (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect())
      }
      sx={{
        scrollSnapAlign: 'center',
        flex: { xs: '0 0 80%', sm: '0 0 46%', md: '1 1 auto' },
        maxWidth: { xs: 340, md: 'none' },
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        border: '1px solid rgba(25,25,25,0.25)',
        borderRadius: '28px',
        p: 1,
        cursor: 'pointer',
        boxShadow: selected
          ? `0 0 0 3px ${TEAL}, 0 14px 30px rgba(25,25,25,0.14)`
          : '0 1px 2px rgba(22, 20, 20, 0.06)',
        transition: 'box-shadow .2s, transform .2s',
        WebkitTapHighlightColor: 'transparent',
        '&:active': { transform: 'scale(0.985)' },
        '&:focus-visible': { outline: `3px solid ${TEAL}`, outlineOffset: 3 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '4 / 3',
          borderRadius: '22px',
          overflow: 'hidden',
          bgcolor: '#E4E0D6',
        }}
      >
        {thumb && (
          <Box
            component="img"
            src={thumb}
            alt=""
            loading="lazy"
            decoding="async"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            px: 1.5,
            py: 0.6,
            borderRadius: 999,
            bgcolor: BRAND,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9375rem',
          }}
        >
          {formatPrice(Number(unit.price_per_night))}
          <Box
            component="span"
            sx={{ fontWeight: 400, opacity: 0.7, fontSize: '0.75rem' }}
          >
            {' '}
            / {isVenue ? 'day' : 'night'}
          </Box>
        </Box>
        {/* {hasOffer(unit) && (
          <Box sx={{ position: 'absolute', left: 10, top: 10, display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.4, borderRadius: 999, bgcolor: SAND, color: INK, fontWeight: 700, fontSize: '0.75rem' }}>
            <OfferIcon sx={{ fontSize: 14 }} /> Deal
          </Box>
        )} */}
      </Box>

      <Box sx={{ px: 1.5, pt: 1.5, pb: 1, flex: 1 }}>
        <Typography
          sx={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: '1.3125rem',
            lineHeight: 1.2,
            color: INK,
            letterSpacing: '-0.01em',
          }}
        >
          {unit.name}
        </Typography>
        {specs && (
          <Typography
            sx={{ mt: 0.5, fontSize: '0.875rem', color: 'rgba(25,25,25,0.65)' }}
          >
            {specs}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          m: 0.5,
          py: 1.25,
          borderRadius: 999,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.9375rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          bgcolor: selected ? BRAND : 'transparent',
          color: selected ? '#fff' : INK,
          border: '1.5px solid',
          borderColor: selected ? BRAND : 'rgba(25,25,25,0.25)',
        }}
      >
        {selected ? (
          <>
            <CheckIcon sx={{ fontSize: 18 }} /> Selected
          </>
        ) : (
          'Select this space'
        )}
      </Box>
    </Box>
  );
};

const Fact: React.FC<{
  value: React.ReactNode;
  label: string;
  small?: boolean;
}> = ({ value, label, small }) => (
  <Box
    sx={{
      p: { xs: 2, md: 2.5 },
      borderRadius: '22px',
      border: '1px solid rgba(255,255,255,0.45)',
    }}
  >
    <Typography
      sx={{
        fontFamily: SERIF,
        fontWeight: 600,
        lineHeight: 1,
        fontSize: small ? '1.25rem' : { xs: '2.5rem', md: '3rem' },
        color: '#fff',
        minHeight: small ? { xs: 40, md: 48 } : undefined,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        mt: 1,
        fontSize: '0.8125rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.6)',
      }}
    >
      {label}
    </Typography>
  </Box>
);

const UnitDetailsList: React.FC<UnitDetailsListProps> = ({
  units,
  activeTab,
  onTabChange,
  showFullDescription,
  setShowFullDescription,
  showAllAmenities,
  setShowAllAmenities,
  displayCount,
  propertyType,
  fallbackImage = '',
  formatPrice,
}) => {
  const list = units ?? [];
  const isVenue = propertyType === 'EVENT_CENTRE';
  const multi = list.length > 1;
  const active = list.find((u) => u.id === activeTab) ?? list[0];
  if (!active) return null;

  const amenities = (active.amenities ?? []).filter((a) =>
    isPublishableAmenity(a?.name)
  );
  const longDescription =
    !!active.description && active.description.length > 250;

  return (
    <Box id="unit-details" sx={{ scrollMarginTop: '140px' }}>
      {multi && (
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <SectionHeading
            eyebrow={`${list.length} spaces`}
            title="Choose your space"
            sub={`Every space has its own photos, rooms and price. Prices are per ${isVenue ? 'day' : 'night'}.`}
          />
          {/* Phones: a swipe carousel with the next card peeking. Desktop: a grid. */}
          <Box
            role="radiogroup"
            aria-label="Available spaces"
            sx={{
              display: { xs: 'flex', md: 'grid' },
              gridTemplateColumns: {
                md: 'repeat(auto-fill, minmax(280px, 1fr))',
              },
              gap: 1.5,
              overflowX: { xs: 'auto', md: 'visible' },
              scrollSnapType: { xs: 'x mandatory', md: 'none' },
              mx: { xs: -2, md: 0 },
              px: { xs: 2, md: 0 },
              pb: 1.5,
              scrollPaddingInline: 16,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {list.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                selected={unit.id === active.id}
                thumb={mediaUrl(unit.media?.[0]) || fallbackImage}
                isVenue={isVenue}
                formatPrice={formatPrice}
                onSelect={() => onTabChange(unit.id)}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* ── The selected space, as a dark panel ─────────────────────────── */}
      <Box
        sx={{
          bgcolor: BRAND,
          color: '#fff',
          borderRadius: { xs: '32px', md: '40px' },
          p: { xs: 2.5, md: 5 },
        }}
      >
        <SectionHeading
          light
          eyebrow={multi ? 'Your selection' : 'The space'}
          title={multi ? active.name : 'About this space'}
        />

        {hasOffer(active) && (
          <DiscountOffers
            onDark
            longStay={active.effective_long_stay_discount_policy}
            extension={active.effective_extension_discount_policy}
            sx={{ mb: 2.5 }}
          />
        )}

        {active.description && (
          <Box sx={{ mb: 3.5, maxWidth: 760 }}>
            <Typography
              sx={{
                lineHeight: 1.75,
                fontSize: '1.0625rem',
                color: 'rgba(255,255,255,0.8)',
                whiteSpace: 'pre-line',
                display: '-webkit-box',
                WebkitLineClamp: showFullDescription ? 'unset' : 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {active.description}
            </Typography>
            {longDescription && (
              <Button
                onClick={() => setShowFullDescription(!showFullDescription)}
                sx={{
                  mt: 0.5,
                  p: 0,
                  minWidth: 0,
                  textTransform: 'none',
                  fontWeight: 700,
                  color: SAND,
                  '&:hover': {
                    bgcolor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                {showFullDescription ? 'Show less' : 'Read more'}
              </Button>
            )}
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 1.25,
            mb: amenities.length ? 4 : 0,
          }}
        >
          <Fact
            value={active.max_guests}
            label={active.max_guests === 1 ? 'Guest' : 'Guests'}
          />
          {!isVenue && active.bedroom_count > 0 && (
            <Fact
              value={active.bedroom_count}
              label={active.bedroom_count === 1 ? 'Bedroom' : 'Bedrooms'}
            />
          )}
          {active.bathroom_count > 0 && (
            <Fact
              value={active.bathroom_count}
              label={
                isVenue
                  ? 'Toilets / baths'
                  : active.bathroom_count === 1
                    ? 'Bathroom'
                    : 'Bathrooms'
              }
            />
          )}
          {!isVenue && active.living_room_count > 0 && (
            <Fact
              value={active.living_room_count}
              label={
                active.living_room_count === 1 ? 'Living room' : 'Living rooms'
              }
            />
          )}
          {!isVenue && active.kitchen_count > 0 && (
            <Fact
              value={active.kitchen_count}
              label={active.kitchen_count === 1 ? 'Kitchen' : 'Kitchens'}
            />
          )}
          {isVenue && !!active.seating_capacity && (
            <Fact value={active.seating_capacity} label="Seated" />
          )}
          {isVenue && !!active.standing_capacity && (
            <Fact value={active.standing_capacity} label="Standing" />
          )}
          {isVenue && !!active.car_park_spaces && (
            <Fact value={active.car_park_spaces} label="Parking spaces" />
          )}
          {isVenue && !!active.power_supply_provision && (
            <Fact small value={active.power_supply_provision} label="Power" />
          )}
        </Box>

        {amenities.length > 0 && (
          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: SAND,
                mb: 1.5,
              }}
            >
              Included
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {amenities
                .slice(0, showAllAmenities ? undefined : displayCount)
                .map((amenity, i) => (
                  <Box
                    key={amenity.id ?? i}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      pl: 1.25,
                      pr: 1.75,
                      py: 0.9,
                      borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.5)',
                      fontSize: '0.9375rem',
                    }}
                  >
                    {React.createElement(amenityIconFor(amenity.name), {
                      sx: { fontSize: 19, color: 'white' },
                    })}
                    {amenity.name}
                  </Box>
                ))}
              {amenities.length > displayCount && (
                <Box
                  component="button"
                  type="button"
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  sx={{
                    all: 'unset',
                    cursor: 'pointer',
                    px: 1.75,
                    py: 0.9,
                    borderRadius: 999,
                    bgcolor: 'white',
                    color: BRAND,
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                  }}
                >
                  {showAllAmenities
                    ? 'Show less'
                    : `+${amenities.length - displayCount} more`}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UnitDetailsList;
