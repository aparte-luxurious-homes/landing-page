'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate } from '@/lib/router';
import CardSection from '../ui/CardSection';

interface GuestPayoutVerificationCardProps {
  kycStatus?: string;
  bvn?: string;
}

function maskValue(val: string) {
  if (!val || val.length < 4) return '***';
  return '*'.repeat(val.length - 4) + val.slice(-4);
}

/**
 * A guest's verification lives on the payout leg, not on a NIN form.
 *
 * A guest has exactly one reason to be verified: getting their caution fee
 * back. That refund lands in their wallet and leaves through a payout account,
 * and supplying a BVN there verifies them automatically — the resolve-account
 * call sets kyc_status = VERIFIED on success. So the bank details they have to
 * enter anyway ARE the verification.
 *
 * Asking the same person for a NIN as well is a second identity check for a
 * need they do not have, and the NIN form carries a requirement they may be
 * unable to satisfy: it needs a first and last name, which an agent booking on
 * their behalf may never have entered (guest_first_name / guest_last_name are
 * Optional at booking).
 *
 * Nothing about logging in or checking in depends on either. Check-in gates on
 * `guest_unclaimed` — ADMIN_ONBOARD with neither is_verified nor
 * email_verified — which is account CLAIMING via the emailed OTP.
 */
export default function GuestPayoutVerificationCard({
  kycStatus,
  bvn,
}: GuestPayoutVerificationCardProps) {
  const navigate = useNavigate();
  const isVerified = kycStatus === 'VERIFIED';

  if (isVerified) {
    return (
      <CardSection title="Identity Verification">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VerifiedUserIcon sx={{ color: '#16a34a', fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Chip
              label="Verified"
              size="small"
              sx={{ backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 600, mb: 0.5 }}
            />
            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
              {bvn
                ? `Verified with your bank details (BVN ${maskValue(bvn)}). Refunds go straight to your account.`
                : 'Your identity is verified. Refunds go straight to your account.'}
            </Typography>
          </Box>
        </Box>
      </CardSection>
    );
  }

  return (
    <CardSection title="Get your caution fee back">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.7 }}>
          Add the bank account you want refunds paid into. We verify your
          identity from your BVN at the same time, so there is nothing else to
          fill in — and your caution fee can be released as soon as you check
          out.
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AccountBalanceIcon />}
            onClick={() => navigate('/account?tab=wallet&bankDetails=1')}
            sx={{
              backgroundColor: '#028090',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#026c7a' },
            }}
          >
            Add bank details
          </Button>
        </Box>
        <Typography variant="caption" sx={{ color: '#999' }}>
          You can book and check in without this — it is only needed to receive
          money.
        </Typography>
      </Box>
    </CardSection>
  );
}
