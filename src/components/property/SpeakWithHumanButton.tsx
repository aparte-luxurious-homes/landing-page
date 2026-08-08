import React from 'react';
import { Button } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { hasWhatsappSupport } from '@/lib/help/support';
import {
  bookingEnquiryUrl,
  type BookingEnquiryContext,
} from '@/lib/help/bookingEnquiry';
import { trackHelpEvent } from '@/lib/help/analytics';

interface SpeakWithHumanButtonProps {
  context: BookingEnquiryContext;
  /** Where this instance lives — used to tell the surfaces apart in analytics. */
  surface: 'booking_sidebar' | 'mobile_booking_bar' | 'mobile_booking_drawer';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * "Speak with a human" — a WhatsApp deep-link carrying the guest's booking
 * context, rendered next to the Book Now CTA.
 *
 * Renders nothing when no support number is configured. That's deliberate:
 * a CTA that opens WhatsApp with a dead number is worse than no CTA, and it
 * lets the feature ship before the real business line is provisioned.
 */
const SpeakWithHumanButton: React.FC<SpeakWithHumanButtonProps> = ({
  context,
  surface,
  fullWidth = true,
  size = 'medium',
}) => {
  if (!hasWhatsappSupport()) return null;

  const handleClick = () => {
    trackHelpEvent('help_contact_clicked', {
      surface,
      channel: 'whatsapp',
      property_id: context.propertyId ?? undefined,
    });
    window.open(bookingEnquiryUrl(context), '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      fullWidth={fullWidth}
      size={size}
      variant="outlined"
      onClick={handleClick}
      startIcon={<WhatsAppIcon />}
      aria-label="Speak with a human on WhatsApp about this stay"
      sx={{
        mt: 1.5,
        py: 1.25,
        textTransform: 'none',
        fontSize: '0.95rem',
        fontWeight: 500,
        // WhatsApp brand green, so the affordance reads as "chat" rather than
        // competing with the primary teal Book Now above it.
        color: '#128C7E',
        borderColor: '#25D366',
        '&:hover': {
          borderColor: '#128C7E',
          backgroundColor: 'rgba(37, 211, 102, 0.08)',
        },
      }}
    >
      Speak with a human
    </Button>
  );
};

export default SpeakWithHumanButton;
