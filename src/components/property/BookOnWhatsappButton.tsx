'use client';

import React from 'react';
import { Button } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { hasWhatsappBot } from '@/lib/help/support';
import {
  bookOnWhatsappUrl,
  type BookOnWhatsappContext,
} from '@/lib/help/bookOnWhatsapp';
import { trackWhatsappCtaClicked } from '@/lib/help/analytics';

interface BookOnWhatsappButtonProps {
  context: BookOnWhatsappContext;
  propertyId?: string | null;
  /** Where this instance lives, to tell the surfaces apart in analytics. */
  surface: 'booking_sidebar' | 'mobile_booking_drawer';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * "Book on WhatsApp": opens the Aparte booking bot with this property and the
 * guest's current dates and guest count pre-filled, so the bot can go straight
 * to availability and a payment link.
 *
 * Sibling of SpeakWithHumanButton (a person on the support line); the two are
 * different numbers and either can be configured without the other. Renders
 * nothing when no bot number is set.
 */
const BookOnWhatsappButton: React.FC<BookOnWhatsappButtonProps> = ({
  context,
  propertyId,
  surface,
  fullWidth = true,
  size = 'medium',
}) => {
  if (!hasWhatsappBot()) return null;

  const handleClick = () => {
    trackWhatsappCtaClicked(surface, propertyId);
    window.open(bookOnWhatsappUrl(context), '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      fullWidth={fullWidth}
      size={size}
      variant="outlined"
      onClick={handleClick}
      startIcon={<WhatsAppIcon />}
      aria-label="Book this stay on WhatsApp"
      sx={{
        mt: 1.5,
        py: 1.25,
        textTransform: 'none',
        fontSize: '0.95rem',
        fontWeight: 500,
        color: '#128C7E',
        borderColor: '#25D366',
        '&:hover': {
          borderColor: '#128C7E',
          backgroundColor: 'rgba(37, 211, 102, 0.08)',
        },
      }}
    >
      Book on WhatsApp
    </Button>
  );
};

export default BookOnWhatsappButton;
