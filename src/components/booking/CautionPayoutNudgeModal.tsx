import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import {
  setPayoutBankNudgeDismissedThisSession,
  WALLET_BANK_DETAILS_PATH,
} from '../../utils/payoutNudgeStorage';

const COPY =
  'If the property is left in good condition, your caution fee will be refunded after checkout. Update your bank details to receive it.';

interface CautionPayoutNudgeModalProps {
  open: boolean;
  onClose: () => void;
}

const CautionPayoutNudgeModal: React.FC<CautionPayoutNudgeModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleDismiss = () => {
    setPayoutBankNudgeDismissedThisSession();
    onClose();
  };

  const handleAddBankDetails = () => {
    setPayoutBankNudgeDismissedThisSession();
    onClose();
    if (isAuthenticated) {
      navigate(WALLET_BANK_DETAILS_PATH);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(WALLET_BANK_DETAILS_PATH)}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
      disableScrollLock={false}
      sx={{ zIndex: 10000 }}
    >
      <DialogTitle sx={{ pr: 6, fontWeight: 600, color: '#124452' }}>
        Caution fee refund
        <IconButton
          aria-label="Dismiss"
          onClick={handleDismiss}
          sx={{ position: 'absolute', right: 8, top: 20, color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {COPY}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={handleDismiss} color="inherit">
          Not now
        </Button>
        <Button variant="contained" onClick={handleAddBankDetails} sx={{ bgcolor: '#028090', '&:hover': { bgcolor: '#026c7a' } }}>
          Add Bank Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CautionPayoutNudgeModal;
