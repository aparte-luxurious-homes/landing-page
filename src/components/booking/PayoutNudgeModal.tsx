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

const PAYOUT_NUDGE_COPY =
  'If the property is left in good condition, your caution fee will be refunded after checkout. Update your bank details to receive it.';

type PayoutNudgeModalProps = {
  open: boolean;
  onClose: () => void;
  onAddBankDetails: () => void;
};

const PayoutNudgeModal: React.FC<PayoutNudgeModalProps> = ({
  open,
  onClose,
  onAddBankDetails,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="body">
    <DialogTitle sx={{ pr: 6, fontWeight: 600, color: '#028090' }}>
      Caution fee refund
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {PAYOUT_NUDGE_COPY}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
      <Button onClick={onClose} color="inherit">
        Not now
      </Button>
      <Button
        variant="contained"
        onClick={onAddBankDetails}
        sx={{ bgcolor: '#028090', '&:hover': { bgcolor: '#026c7a' } }}
      >
        Add Bank Details
      </Button>
    </DialogActions>
  </Dialog>
);

export default PayoutNudgeModal;
