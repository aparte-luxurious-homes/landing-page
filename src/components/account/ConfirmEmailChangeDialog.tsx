'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

interface ConfirmEmailChangeDialogProps {
  open: boolean;
  /** The address the person is about to switch to. */
  email: string;
  saving?: boolean;
  /** Message from a failed save, shown inside the dialog. */
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * The "are you sure" step before an email change is saved.
 *
 * Changing the address moves every booking confirmation, receipt and sign-in
 * code to it, and a typo here is exactly the failure this whole feature
 * exists to fix — so the new address is read back once, in full, first.
 */
export default function ConfirmEmailChangeDialog({
  open,
  email,
  saving = false,
  error,
  onCancel,
  onConfirm,
}: ConfirmEmailChangeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onCancel}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Use this email?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#444', mb: 1.5 }}>
          We&apos;ll send future emails to
        </Typography>
        <Typography
          sx={{ fontWeight: 600, color: '#13272b', wordBreak: 'break-all', mb: 1.5 }}
        >
          {email}
        </Typography>
        <Typography variant="body2" sx={{ color: '#5b6f72' }}>
          That includes booking confirmations, receipts and sign-in codes. Check
          it&apos;s typed correctly.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={saving}
          sx={{ textTransform: 'none', color: '#555', fontWeight: 500 }}
        >
          Go back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={saving}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '12px',
            backgroundColor: '#028090',
            '&:hover': { backgroundColor: '#026d7a' },
          }}
        >
          {saving ? 'Saving...' : 'Yes, use this email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

