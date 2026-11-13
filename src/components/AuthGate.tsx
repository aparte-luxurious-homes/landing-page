'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { useLocation, useNavigate } from '@/lib/router';
import { useAppSelector } from '../hooks';

/**
 * App Router replacement for ProtectedRoute.
 *
 * Same behaviour, restructured: react-router gated a route tree by rendering
 * <Outlet/> conditionally, which the App Router has no equivalent for. Here
 * the protected page passes its content as children instead.
 *
 * Auth is client-side (the token lives in sessionStorage), so the server
 * always renders the unauthenticated branch. The `checked` flag suppresses
 * the login dialog for the first client tick, otherwise a logged-in user
 * sees it flash on every hard navigation before the store rehydrates.
 */
const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.root.auth);

  const isAuthenticated = auth.isAuthenticated && !!auth.token;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  const handleClose = () => {
    navigate(-1);
  };

  const handleLoginRedirect = () => {
    navigate(`/login?redirect=${location.pathname}`);
  };

  if (isAuthenticated) return <>{children}</>;

  // Don't render the dialog until the client has had a chance to rehydrate.
  if (!checked) return null;

  return (
    <Dialog fullWidth open onClose={() => {}}>
      <DialogTitle>Authentication Required</DialogTitle>
      <DialogContent>
        <Typography>You need to be logged in to access this page.</Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px' }}>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={handleLoginRedirect} color="primary" variant="contained">
          Go to Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthGate;
