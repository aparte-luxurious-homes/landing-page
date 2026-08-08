'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Modal,
  Typography,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface WarningModalProps {
  message: string;
  onConfirm: () => void;
  onTimeout: () => void;
  timeoutSeconds?: number;
}

const StyledModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  width: '90%',
  maxWidth: 450,
  outline: 'none',
  position: 'relative',
  overflow: 'hidden',
}));

const ProgressBar = styled(Box)<{ value: number }>(({ value }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  height: 4,
  backgroundColor: '#028090',
  width: `${value}%`,
  transition: 'width 1s linear',
}));

const TimerCircle = styled(Box)({
  width: 60,
  height: 60,
  borderRadius: '50%',
  border: `3px solid #028090`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.05)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
});

const TimerText = styled(Typography)({
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#028090',
});

const StayLoggedInButton = styled(Button)({
  backgroundColor: '#028090',
  color: 'white',
  padding: '10px 24px',
  borderRadius: 8,
  '&:hover': {
    backgroundColor: '#026b78',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(2, 128, 144, 0.3)',
  },
});

const WarningModal: React.FC<WarningModalProps> = ({
  message,
  onConfirm,
  onTimeout,
  timeoutSeconds = 60
}) => {
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (timeLeft <= 0) {
      setOpen(false);
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  const progressValue = (timeLeft / timeoutSeconds) * 100;

  return (
    <StyledModal
      open={open}
      onClose={handleConfirm}
      aria-labelledby="session-timeout-modal"
    >
      <ModalContent>
        <ProgressBar value={progressValue} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" fontWeight={600}>
            Session Timeout
          </Typography>
          <TimerCircle>
            <TimerText>{timeLeft}s</TimerText>
          </TimerCircle>
        </Box>

        <Typography variant="body1" sx={{ mb: 2, color: 'text.primary' }}>
          {message}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          You will be automatically logged out in <strong>{timeLeft} seconds</strong> if you don't respond.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onTimeout}
            sx={{ 
              borderColor: '#e0e0e0',
              color: 'text.secondary',
              '&:hover': {
                borderColor: '#b0b0b0',
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            Logout Now
          </Button>
          <StayLoggedInButton
            variant="contained"
            onClick={handleConfirm}
            disableElevation
          >
            Stay Logged In
          </StayLoggedInButton>
        </Box>
      </ModalContent>
    </StyledModal>
  );
};

export default WarningModal;