import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../app/store';
import WarningModal from '../warningmodal/warningmodal';
import { Alert } from '@mui/material';

interface IdleTimeoutWithWarningProps {
  idleTime?: number;
  warningTime?: number;
  children: React.ReactNode;
}

const IdleTimeoutWithWarning: React.FC<IdleTimeoutWithWarningProps> = ({
  idleTime = 2 * 60 * 1000,
  warningTime = 1 * 60 * 1000,
  children,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const successHideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get auth state directly from Redux - adjust path based on your store structure
  const isAuthenticated = useSelector((state: RootState) => {
    // Based on your localStorage, the auth is likely under state.root?.auth
    // or state.auth depending on your reducer setup
    return state.root?.auth?.isAuthenticated || false;
  });

  const handleLogout = useCallback(() => {
    setShowSuccessMessage(true);

    // Dispatch Redux logout action
    dispatch(logout());
    // Hide success message after 2 seconds (same time as redirect)
    successHideTimeoutRef.current = setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000);

    // Redirect after 2 seconds
    successTimeoutRef.current = setTimeout(() => {
      navigate('/login', {
        state: {
          message:
            'Your session has expired due to inactivity. Please log in again.',
        },
      });
    }, 2000);
  }, [dispatch, navigate]);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    setShowSuccessMessage(false);

    // Clear existing timeouts
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);

    if (!isAuthenticated) return;

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
    }, idleTime - warningTime);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      setShowWarning(false);
      handleLogout();
    }, idleTime);
  }, [idleTime, warningTime, handleLogout, isAuthenticated]);

  const handleStayLoggedIn = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleActivity = useCallback(() => {
    if (isAuthenticated) {
      resetTimer();
    }
  }, [resetTimer, isAuthenticated]);

  useEffect(() => {
    // Don't start timer if not authenticated
    if (!isAuthenticated) {
      console.log('User not authenticated, idle timer disabled');
      return;
    }

    console.log('User authenticated, starting idle timer');

    // Track user activity
    const events = [
      'mousedown',
      'keydown',
      'mousemove',
      'touchstart',
      'scroll',
      'click',
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);

      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity, resetTimer, isAuthenticated]);

  return (
    <>
      {children}
      {showWarning && isAuthenticated && (
        <WarningModal
          message="Your session is about to expire due to inactivity."
          onConfirm={handleStayLoggedIn}
          onTimeout={handleLogout}
          timeoutSeconds={Math.floor(warningTime / 1000)}
        />
      )}
      {showSuccessMessage && (
        <Alert
          severity="success"
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
            backgroundColor: '#ffff',
            color: '#028090',
            border: '1px solid rgba(2, 128, 144, 0.3)',
            '& .MuiAlert-icon': {
              color: '#028090',
            },
            animation: 'slideIn 0.3s ease-out',
            '@keyframes slideIn': {
              '0%': {
                transform: 'translateX(100%)',
                opacity: 0,
              },
              '100%': {
                transform: 'translateX(0)',
                opacity: 1,
              },
            },
          }}
        >
          Session expired due to inactivity! You will be logged out in 2
          seconds.
        </Alert>
      )}
    </>
  );
};

export default IdleTimeoutWithWarning;
