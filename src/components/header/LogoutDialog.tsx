import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Confirm Logout
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to logout?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error">Logout</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog; 